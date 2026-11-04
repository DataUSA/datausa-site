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
 * compute themselves if it gave up. A failed computation leaves a short `failed` mark so the waiting
 * renders do not repeat a query that just failed.
 */
import {createHash} from "node:crypto";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisConfigured, withRedis} from "@/lib/cache/redis";
import {decodeOutput, encodeOutput, epochSnapshot, jsonProblem, storeEntries, type EntryWrite} from "@/lib/cache/store";
import type {GeneratorDefinition, Variables} from "@/lib/reports/types";

const LOCK_MS = Number(process.env.GEN_CACHE_LOCK_MS ?? 60_000);
const FAILED_MARK_MS = 10_000;
const POLL_MS = 150;

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

function failedOutcome(kind: FailureKind, message: string, n: number): SharedOutcome {
  return {status: 0, durationMs: 0, results: Array.from({length: n}, () => ({ok: false as const, kind, message}))};
}

const isSuccess = (c: GroupComputation) => c.status >= 200 && c.status < 300 && !c.upstreamFailures.length;

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
export function planGroupKeys(attrs: Variables, groups: Group[]): PlannedGroup[] {
  const attrsHash = hash(stableJson(attrs));
  return groups.map(group => {
    const urlHash = hash(/^\/?api\//.test(group.url) ? `legacy:${attrs.tesseract}|${attrs.geoservice}|${group.url}` : group.url);
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
      const {output} = decodeOutput(texts[i]);
      resolved.set(g, {result: {ok: true, output}, status: 200, durationMs: 0, cache: state});
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

    // 3. cross-worker locks for the groups that can be shared
    const lockable = canWrite ? toCompute.filter(p => p.shareable && !inflight.has(p.groupKey)) : [];
    const owned = new Set<string>();
    if (lockable.length) {
      const replies = await timed(withRedis("write", async client => {
        const pipeline = client.pipeline();
        lockable.forEach(p => pipeline.set(`lock:${p.groupKey}`, String(process.pid), "PX", LOCK_MS, "NX"));
        return pipeline.exec();
      }, lockable.length));
      if (!replies) lockable.forEach(p => owned.add(p.groupKey)); // Redis failed: compute ourselves
      else replies.forEach(([error, reply], i) => { if (error || reply === "OK") owned.add(lockable[i].groupKey); });
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
        if (!reason && (!r.output || typeof r.output !== "object")) reason = "logic returned no object";
        if (!reason && !computation.tags?.length) reason = "URL maps to no tag";
        const problem = !reason && r.output ? jsonProblem(r.output) : null;
        if (problem) reason = `not JSON-safe: ${problem}`;
        if (reason) {
          uncachedReasons.set(p.group.generators[i], reason);
          return {ok: true, json: null, output: r.output};
        }
        const g = p.group.generators[i];
        const json = encodeOutput(r.output!, {g: g.id, m: ctx.memberId, p: ctx.profile});
        writes.push({key: p.keys[i]!, value: json, tags: computation.tags!, owner});
        return {ok: true, json, output: r.output};
      });
      if (writes.length && epochs) {
        const stored = await timed(storeEntries(writes, epochs));
        stats.stored += stored; // not `+= await`: concurrent groups would overwrite each other's count
      }
      if (owned.has(p.groupKey)) {
        const failed = results.some(r => !r.ok);
        // a failure leaves a short mark so the renders waiting on it do not repeat the query at once
        void withRedis("write", async client => {
          if (failed) await client.set(`lock:${p.groupKey}`, "failed", "PX", FAILED_MARK_MS);
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
        else if (r.json !== null) result = {ok: true, output: decodeOutput(r.json).output};
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
          if (texts.every(Boolean)) {
            fromCache(p, "wait", texts as string[]);
            stats.waits += p.keys.length;
          }
          else if (lock === "failed") {
            settle(p, failedOutcome("concurrent", "failed in a concurrent render a moment ago", p.keys.length), "wait", false);
            stats.waits += p.keys.length;
          }
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
