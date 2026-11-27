/**
 * The generator cache: the output of each report generator for one member, in Redis, tagged by the
 * cube it read (`docs/architecture.md`, "Generator cache").
 *
 *   gen:<generator id>:<generator version>:<hash of resolved URL>:<hash of the attributes>
 *
 * - The version comes from the build manifest (`src/lib/cache/manifest.ts`): editing a generator
 *   changes only its key, editing shared code changes all of them, and a deploy that changes neither
 *   keeps every entry.
 * - The URL carries the Tesseract host, so two environments sharing a Redis never share entries.
 * - The attributes hash covers everything the logic reads besides the response.
 *
 * The engine groups generators by URL: generators that share a URL also share its response, and a
 * few of them change it (add columns) for the ones after them. A group is computed together (one
 * fetch, then every generator's logic in template order) whenever any of its outputs is missing,
 * exactly as an uncached render does, and is served from the cache only when all of them are there.
 *
 * Only successes are stored: a 2xx response, logic that did not throw and returned an object,
 * nothing upstream failed while answering it (in-process endpoints read several sources), the URL
 * maps to a tag, the output survives JSON, and the generator is not in `UNCACHED_GENERATORS`.
 *
 * Coalescing: within a worker, renders that need the same group share one computation; across
 * workers, the first takes `lock:<group>` (`SET NX PX`) and the others poll for its entries, then
 * compute themselves if it gave up.
 *
 * Failures are remembered in the same `lock:<group>` key, as a `failed|…` mark naming the failed
 * generators. A render that finds the mark answers at once: siblings that succeeded from their
 * entries, the failed ones with the remembered failure, without querying the API again. How long a
 * mark lasts depends on whether the failure can change on a retry (`failureMarkMs`): hours for an
 * answer that will not change (4xx, logic that threw, no data), seconds for timeouts and network
 * errors. A 5xx is never remembered: every render that meets one retries it itself. Warm renders
 * (`retryFailures`) ignore marks, query again and replace or clear the mark. A new generator version
 * or new attributes give a new group key, so a fixed generator is never held back by an old mark.
 */
import {createHash} from "node:crypto";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisConfigured, withRedis} from "@/lib/cache/redis";
import {decodeOutput, encodeOutput, epochSnapshot, jsonProblem, storeEntries, type EntryWrite} from "@/lib/cache/store";
import type {GeneratorDefinition, Variables} from "@/lib/reports/types";

const LOCK_MS = Number(process.env.GEN_CACHE_LOCK_MS ?? 60_000);
/** Timeouts, network errors, a busy limiter, a failed upstream read: retry soon. */
const FAILED_TRANSIENT_MS = 10_000;
/** An answer that will not change on a retry: a 4xx, logic that threw on the data, no data. */
const FAILED_FINAL_MS = Number(process.env.GEN_CACHE_FAILED_MS ?? 6 * 3_600_000);
const POLL_MS = 150;
const FAILED_PREFIX = "failed";

export const hash = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 16);

/** JSON with object keys sorted, so equal attributes always hash the same. */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_, v) => v && typeof v === "object" && !Array.isArray(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k]]))
    : v);
}

export type FailureKind = "http" | "timeout" | "limiter" | "network" | "parse" | "logic" | "url" | "no-data" | "upstream" | "concurrent";

/** What one generator produced in a computation. */
export type GeneratorResult =
  | {ok: true; output: Variables | undefined}
  | {ok: false; kind: FailureKind; message: string};

/** One computation of a URL group: the fetch, then each generator's logic. */
export interface GroupComputation {
  status: number;
  durationMs: number;
  results: GeneratorResult[];
  /** Tags of what the fetch read, or null when part of it maps to no tag. */
  tags: string[] | null;
  /** Upstream reads that failed while answering (in-process endpoints read several sources). */
  upstreamFailures: string[];
}

export interface Group {
  url: string;
  generators: GeneratorDefinition[];
}

export type CacheState = "hit" | "miss" | "wait" | "off";

export interface ResolvedGenerator {
  result: GeneratorResult;
  status: number;
  durationMs: number;
  cache: CacheState;
  /** Why a computed output was not stored. */
  uncached?: string;
}

export interface CacheStats {
  enabled: boolean;
  hits: number;
  misses: number;
  waits: number;
  off: number;
  stored: number;
  total: number;
  redisMs: number;
}

interface Context {
  profile: string;
  memberId: string;
  attrs: Variables;
  groups: Group[];
  compute: (group: Group) => Promise<GroupComputation>;
  concurrency: number;
  limit: <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) => Promise<R[]>;
  /** Query groups whose failure is remembered instead of answering from the mark (warm renders). */
  retryFailures?: boolean;
}

/** The outcome of a computation as shared between renders: outputs as JSON, so each render gets its own copy. */
interface SharedOutcome {
  status: number;
  durationMs: number;
  results: ({ok: true; json: string | null; output?: Variables} | {ok: false; kind: FailureKind; message: string})[];
}

const store = globalThis as typeof globalThis & {__genCacheInflightV1?: Map<string, Promise<SharedOutcome>>};
const inflight: Map<string, Promise<SharedOutcome>> = store.__genCacheInflightV1 ??= new Map();

/** Whether the generator cache is on: Redis configured and a manifest present. */
export function generatorCacheEnabled(): boolean {
  return redisConfigured() && generatorManifest() !== null;
}

function versionOf(g: GeneratorDefinition, url: string): string | null {
  const manifest = generatorManifest();
  const version = manifest?.generators[String(g.id)];
  if (!manifest || !version) return null;
  return /^\/?api\//.test(url) ? hash(`${version}:${manifest.legacy}`) : version;
}

/**
 * Generators recomputed on every render: their output depends on something besides the response and
 * the member attributes, which a cached copy would freeze until the next purge of their cube. 427,
 * 429, 432 and 433 pick the latest year before the current calendar year (`new Date()`).
 * `GENERATOR_CACHE_SKIP` (comma-separated ids) adds more without a code change.
 */
const UNCACHED_GENERATORS = new Set([
  427, 429, 432, 433,
  ...(process.env.GENERATOR_CACHE_SKIP ?? "").split(",").map(Number).filter(Number.isFinite).filter(Boolean)
]);

/** Why a generator is never stored, or null. */
function ineligible(g: GeneratorDefinition, url: string, version: string | null): string | null {
  if (UNCACHED_GENERATORS.has(g.id)) return "uncached (clock)";
  if (url.startsWith("error:")) return "bad URL";
  if (!version) return "not in the manifest";
  return null;
}

const isSuccess = (c: GroupComputation) => c.status >= 200 && c.status < 300 && !c.upstreamFailures.length;

/**
 * Non-finite numbers in generator outputs. Content produces them (a share of a total of 0) and an
 * uncached render keeps them, but JSON cannot hold them, so they are written as markers (a NUL, which
 * no content produces, then the name) and restored on read. Without this such an output is never
 * stored and the generator is recomputed from the API on every visit. Done here rather than in
 * `store.ts`, whose code is part of the attribute, lookup and endpoint hashes in the manifest.
 */
const NON_FINITE: Record<string, number> = {"\u0000NaN": NaN, "\u0000Infinity": Infinity, "\u0000-Infinity": -Infinity};

function mapValues(value: unknown, fn: (v: unknown) => unknown): unknown {
  const v = fn(value);
  if (Array.isArray(v)) return v.map(x => mapValues(x, fn));
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mapValues(x, fn)]));
  }
  return v;
}

const markNonFinite = (output: Variables) => mapValues(output, v => typeof v === "number" && !Number.isFinite(v)
  ? Number.isNaN(v) ? "\u0000NaN" : v > 0 ? "\u0000Infinity" : "\u0000-Infinity"
  : v) as Variables;

const hasMarker = (text: string) => text.includes("\\u0000NaN") || text.includes("\\u0000Infinity") || text.includes("\\u0000-Infinity");

/** `decodeOutput`, with non-finite numbers restored. */
function readOutput(text: string): Variables {
  const {output} = decodeOutput(text);
  return hasMarker(text) ? mapValues(output, v => typeof v === "string" && v in NON_FINITE ? NON_FINITE[v] : v) as Variables : output;
}

/** A remembered failure of a group: the status, and each failed generator's index, kind and message. */
interface FailureMark {
  s: number;
  /** null for a mark from before failures were itemised: every output not in the cache counts as failed. */
  f: [number, FailureKind, string][] | null;
}

const encodeMark = (mark: FailureMark) => `${FAILED_PREFIX}|${JSON.stringify(mark)}`;

/** The failure mark in a `lock:<group>` value, or null when the value is a lock or nothing. */
function parseMark(value: unknown): FailureMark | null {
  if (typeof value !== "string" || !value.startsWith(FAILED_PREFIX)) return null;
  if (value === FAILED_PREFIX) return {s: 0, f: null};
  try {
    return JSON.parse(value.slice(FAILED_PREFIX.length + 1)) as FailureMark;
  }
  catch {
    return {s: 0, f: null};
  }
}

/**
 * How long to remember a group's failure, or 0 for none. A 5xx is never remembered (a requirement:
 * no render may show a failure because of an earlier 5xx; each retries it). Otherwise the shortest
 * rule among its failures wins. A mark also hides siblings that succeeded but could not be stored,
 * so then it is kept as short as a transient failure.
 */
function failureMarkMs(computation: GroupComputation, results: SharedOutcome["results"]): number {
  const failures = computation.results.filter((r): r is Extract<GeneratorResult, {ok: false}> => !r.ok);
  if (!failures.length) return 0;
  if (computation.status >= 500) return 0;
  // the failed fetch itself is also noted as an upstream failure; its status decides below. Other
  // failed reads (inside an in-process endpoint that still answered) may not happen again.
  if (computation.upstreamFailures.length && !failures.some(f => f.kind === "http")) return FAILED_TRANSIENT_MS;
  let ms = FAILED_FINAL_MS;
  for (const f of failures) {
    if (f.kind === "http") ms = Math.min(ms, computation.status >= 400 ? FAILED_FINAL_MS : FAILED_TRANSIENT_MS);
    else if (f.kind !== "logic" && f.kind !== "no-data" && f.kind !== "url") ms = Math.min(ms, FAILED_TRANSIENT_MS);
  }
  if (results.some(r => r.ok && r.json === null)) ms = Math.min(ms, FAILED_TRANSIENT_MS);
  return ms;
}

/** The cache keys of one URL group of a render. */
export interface PlannedGroup {
  group: Group;
  /** Each generator's key, or null when it is never stored. */
  keys: (string | null)[];
  /** Why a generator is never stored, or null. */
  reasons: (string | null)[];
  /** Every generator of the group can be stored: the group may be shared and served from the cache. */
  shareable: boolean;
  groupKey: string;
}

/**
 * The keys a render of these attributes reads and writes, per URL group. `resolveGenerators` uses
 * it, and so does the batched warmer to tell which reports are already a full hit.
 */
/** The attribute fields that only say which servers to ask (`tesseract`, `geoservice`), not what the data is. */
export const HOST_FIELDS = ["tesseract", "geoservice"] as const;

/** Attributes without the server base URLs, as they are hashed into keys and stored in the cache. */
export function withoutHosts(attrs: Variables): Variables {
  const out: Variables = {...attrs};
  for (const field of HOST_FIELDS) delete out[field];
  return out;
}

/**
 * A URL with the Tesseract and geoservice base URLs replaced by placeholders. Keys never contain a
 * host: a cache warmed against one server (api-penn.datausa.io) serves a site reading another
 * (api.datausa.io) as long as both carry the same data, and moving the API to a new hostname keeps
 * the cache. Which data an entry holds is tracked by its cube tags and purges, not by the host.
 */
export function hostFree(url: string, attrs: Variables): string {
  for (const field of HOST_FIELDS) {
    const base = attrs[field];
    if (typeof base === "string" && base && url.startsWith(base)) return `{${field}}/${url.slice(base.length).replace(/^\//, "")}`;
  }
  return url;
}

export function planGroupKeys(attrs: Variables, groups: Group[]): PlannedGroup[] {
  const attrsHash = hash(stableJson(withoutHosts(attrs)));
  return groups.map(group => {
    // in-process `/api/...` answers read Tesseract and the geoservice at whatever host is configured
    const urlHash = hash(/^\/?api\//.test(group.url) ? `legacy:${group.url}` : hostFree(group.url, attrs));
    const keys: (string | null)[] = [];
    const reasons: (string | null)[] = [];
    for (const g of group.generators) {
      const version = versionOf(g, group.url);
      const reason = ineligible(g, group.url, version);
      reasons.push(reason);
      keys.push(reason ? null : `gen:${g.id}:${version}:${urlHash}:${attrsHash}`);
    }
    const shareable = keys.every(Boolean);
    const groupKey = keys.length === 1 && keys[0] ? keys[0] : `grp:${hash(keys.join(","))}:${urlHash}:${attrsHash}`;
    return {group, keys, reasons, shareable, groupKey};
  });
}

/**
 * Resolves every generator of a render: reads all keys at once, computes only the groups with a
 * missing output (sharing computations with concurrent renders), stores the successes, and returns
 * each generator's output in the order of `groups`.
 */
export async function resolveGenerators(ctx: Context): Promise<{resolved: Map<GeneratorDefinition, ResolvedGenerator>; stats: CacheStats}> {
  const stats: CacheStats = {enabled: true, hits: 0, misses: 0, waits: 0, off: 0, stored: 0, total: 0, redisMs: 0};
  const timed = async <T>(p: Promise<T>): Promise<T> => {
    const t = performance.now();
    try {
      return await p;
    }
    finally {
      stats.redisMs += performance.now() - t;
    }
  };
  const owner = `${ctx.profile}|${ctx.memberId}`;
  type Planned = PlannedGroup;
  const planned: Planned[] = planGroupKeys(ctx.attrs, ctx.groups);

  // 1. one read for every key of the render
  const allKeys = planned.flatMap(p => p.keys.filter((k): k is string => Boolean(k)));
  const values = allKeys.length ? await timed(withRedis("read", client => client.mget(...allKeys), allKeys.length)) : [];
  const redisUp = values !== undefined;
  if (!redisUp) stats.enabled = false;
  const cached = new Map<string, string>();
  allKeys.forEach((k, i) => { const v = values?.[i]; if (v) cached.set(k, v); });

  const resolved = new Map<GeneratorDefinition, ResolvedGenerator>();
  const fromCache = (p: Planned, state: CacheState, texts: string[]) => {
    p.group.generators.forEach((g, i) => {
      const output = readOutput(texts[i]);
      resolved.set(g, {result: {ok: true, output}, status: 200, durationMs: 0, cache: state});
    });
  };

  /** Answers a group from a failure mark: entries for the siblings that have one, the remembered failure for the rest. */
  const fromMark = (p: Planned, mark: FailureMark, texts: (string | null | undefined)[]) => {
    p.group.generators.forEach((g, i) => {
      const text = texts[i];
      if (text) {
        resolved.set(g, {result: {ok: true, output: readOutput(text)}, status: 200, durationMs: 0, cache: "hit"});
        stats.hits += 1;
        return;
      }
      const failed = mark.f?.find(([index]) => index === i);
      const result: GeneratorResult = failed
        ? {ok: false, kind: failed[1], message: failed[2]}
        : {ok: false, kind: "concurrent", message: "failed in a concurrent render a moment ago"};
      resolved.set(g, {result, status: mark.s, durationMs: 0, cache: "wait", uncached: "failure remembered"});
      stats.waits += 1;
    });
  };

  const toCompute: Planned[] = [];
  for (const p of planned) {
    if (p.shareable && p.keys.every(k => cached.has(k!))) {
      fromCache(p, "hit", p.keys.map(k => cached.get(k!)!));
      stats.hits += p.keys.length;
    }
    else toCompute.push(p);
  }

  if (toCompute.length) {
    // 2. purge counters before fetching anything
    const epochs = redisUp ? await timed(epochSnapshot()) : undefined;
    const canWrite = Boolean(epochs);

    // 3. cross-worker locks for the groups that can be shared; a lock already held may be a failure mark
    const lockable = canWrite ? toCompute.filter(p => p.shareable && !inflight.has(p.groupKey)) : [];
    const owned = new Set<string>();
    const marked = new Map<string, FailureMark>();
    if (lockable.length) {
      const replies = await timed(withRedis("write", async client => {
        const pipeline = client.pipeline();
        lockable.forEach(p => {
          pipeline.set(`lock:${p.groupKey}`, String(process.pid), "PX", LOCK_MS, "NX");
          pipeline.get(`lock:${p.groupKey}`);
        });
        return pipeline.exec();
      }, 2 * lockable.length));
      if (!replies) lockable.forEach(p => owned.add(p.groupKey)); // Redis failed: compute ourselves
      else {
        lockable.forEach((p, i) => {
          const [error, reply] = replies[2 * i] ?? [null, null];
          if (error || reply === "OK") owned.add(p.groupKey);
          else {
            const mark = parseMark(replies[2 * i + 1]?.[1]);
            // a warm render queries again and replaces the mark (or clears it on success)
            if (mark && ctx.retryFailures) owned.add(p.groupKey);
            else if (mark) marked.set(p.groupKey, mark);
          }
        });
      }
    }

    const uncachedReasons = new Map<GeneratorDefinition, string>();
    const run = async (p: Planned): Promise<SharedOutcome> => {
      const computation = await ctx.compute(p.group);
      const success = isSuccess(computation);
      const writes: EntryWrite[] = [];
      const results: SharedOutcome["results"] = computation.results.map((r, i) => {
        if (!r.ok) return r;
        let reason = p.reasons[i];
        if (!reason && !success) reason = computation.upstreamFailures.length ? "an upstream read failed" : `HTTP ${computation.status}`;
        // logic that returns nothing is stored as nothing, so it is not rerun on every visit
        if (!reason && r.output != null && typeof r.output !== "object") reason = "logic returned a non-object";
        if (!reason && !computation.tags?.length) reason = "URL maps to no tag";
        let stored = r.output;
        let problem = !reason && stored ? jsonProblem(stored) : null;
        if (problem && /is (-?Infinity|NaN)$/.test(problem)) {
          stored = markNonFinite(stored!);
          problem = jsonProblem(stored);
        }
        if (problem) reason = `not JSON-safe: ${problem}`;
        if (reason) {
          uncachedReasons.set(p.group.generators[i], reason);
          return {ok: true, json: null, output: r.output};
        }
        const g = p.group.generators[i];
        const json = encodeOutput(stored!, {g: g.id, m: ctx.memberId, p: ctx.profile});
        writes.push({key: p.keys[i]!, value: json, tags: computation.tags!, owner});
        return {ok: true, json, output: r.output};
      });
      if (writes.length && epochs) {
        const stored = await timed(storeEntries(writes, epochs));
        stats.stored += stored; // not `+= await`: concurrent groups would overwrite each other's count
      }
      if (owned.has(p.groupKey)) {
        // a failure leaves a mark so later renders do not repeat the query (see `failureMarkMs`)
        const markMs = failureMarkMs(computation, results);
        const mark: FailureMark = {
          s: computation.status,
          f: computation.results.flatMap((r, i): [number, FailureKind, string][] => r.ok ? [] : [[i, r.kind, r.message.slice(0, 300)]])
        };
        void withRedis("write", async client => {
          if (markMs) await client.set(`lock:${p.groupKey}`, encodeMark(mark), "PX", markMs);
          else await client.del(`lock:${p.groupKey}`);
        });
      }
      return {status: computation.status, durationMs: computation.durationMs, results};
    };

    /** `computedHere`: this render ran the computation and may use its objects as they are. */
    const settle = (p: Planned, outcome: SharedOutcome, state: CacheState, computedHere: boolean) => {
      p.group.generators.forEach((g, i) => {
        const r = outcome.results[i];
        let result: GeneratorResult;
        if (!r.ok) result = r;
        // this render's own objects as they are (like an uncached render); a copy for anyone else
        else if (computedHere) result = {ok: true, output: r.output};
        else if (r.json !== null) result = {ok: true, output: readOutput(r.json)};
        else result = {ok: true, output: undefined};
        resolved.set(g, {result, status: outcome.status, durationMs: outcome.durationMs, cache: state, uncached: uncachedReasons.get(g) ?? p.reasons[i] ?? undefined});
      });
    };

    const waiting: Planned[] = [];
    // 4. compute what this render owns, sharing within the worker
    await ctx.limit(toCompute, ctx.concurrency, async p => {
      if (p.shareable) {
        const existing = inflight.get(p.groupKey);
        if (existing) {
          const outcome = await existing;
          // an output that could not be shared as JSON is recomputed by this render
          if (outcome.results.every(r => !r.ok || r.json !== null)) {
            settle(p, outcome, "wait", false);
            stats.waits += p.keys.length;
            return;
          }
        }
        else if (marked.has(p.groupKey)) {
          fromMark(p, marked.get(p.groupKey)!, p.keys.map(k => cached.get(k!)));
          return;
        }
        else if (canWrite && !owned.has(p.groupKey)) {
          waiting.push(p);
          return;
        }
        else {
          const promise = run(p);
          inflight.set(p.groupKey, promise);
          try {
            settle(p, await promise, "miss", true);
          }
          finally {
            inflight.delete(p.groupKey);
          }
          stats.misses += p.keys.length;
          return;
        }
      }
      const outcome = await run(p);
      settle(p, outcome, p.shareable ? "miss" : "off", true);
      if (p.shareable) stats.misses += p.keys.length;
      else stats.off += p.keys.length;
    });

    // 5. groups another worker is computing: poll for its entries, compute ourselves if it gives up
    if (waiting.length) {
      const deadline = Date.now() + LOCK_MS;
      let pending = waiting;
      while (pending.length && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, POLL_MS));
        const keys = pending.flatMap(p => p.keys as string[]);
        const locks = pending.map(p => `lock:${p.groupKey}`);
        const replies = await timed(withRedis("read", client => client.mget(...keys, ...locks), keys.length + locks.length));
        if (!replies) break;
        const next: Planned[] = [];
        let offset = 0;
        pending.forEach((p, i) => {
          const texts = replies.slice(offset, offset + p.keys.length);
          offset += p.keys.length;
          const lock = replies[keys.length + i];
          const mark = parseMark(lock);
          if (texts.every(Boolean)) {
            fromCache(p, "wait", texts as string[]);
            stats.waits += p.keys.length;
          }
          else if (mark && ctx.retryFailures) {
            owned.add(p.groupKey);
            next.push(p);
          }
          else if (mark) fromMark(p, mark, texts);
          else if (lock === null) {
            owned.add(p.groupKey); // the other worker finished without storing: compute ourselves
            next.push(p);
          }
          else next.push(p);
        });
        const ours = next.filter(p => owned.has(p.groupKey));
        pending = next.filter(p => !owned.has(p.groupKey));
        if (ours.length) {
          await ctx.limit(ours, ctx.concurrency, async p => {
            settle(p, await run(p), "miss", true);
            stats.misses += p.keys.length;
          });
        }
      }
      if (pending.length) {
        await ctx.limit(pending, ctx.concurrency, async p => {
          settle(p, await run(p), "miss", true);
          stats.misses += p.keys.length;
        });
      }
    }
  }

  stats.total = planned.reduce((n, p) => n + p.group.generators.length, 0);
  return {resolved, stats};
}
