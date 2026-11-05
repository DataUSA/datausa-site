/**
 * A worker of the batched warmer (`npm run warm:batch`, `docs/architecture.md`, "Batched warmer").
 * It takes one member group at a time (up to a few hundred members of one level) and:
 *
 * 1. plan: computes each member's attributes and plans its render (`planReport`, the render's own
 *    planning), and leaves out reports that are already a full hit in Redis;
 * 2. skip: answers queries naming a level the cube lacks with the failure Tesseract gives them,
 *    learnt once per (endpoint, cube, missing levels, measures) from a real request;
 * 3. shared: gets URLs without the member id (national, state, county...) from the coordinator,
 *    which fetches each once for the whole run;
 * 4. verify + batch: groups member-keyed URLs by shape, and for shapes that passed the verification
 *    gate fetches all members at once and splits the answer per member;
 * 5. single: fetches what is left one URL at a time;
 * 6. render: runs the real engine for each member inside a warm scope (`warm-scope.ts`) that serves
 *    those responses; the engine writes the normal generator cache entries.
 *
 * Every Tesseract request waits for a slot of the coordinator's global cap.
 */
import {appendFileSync} from "node:fs";
import {join} from "node:path";
import {GEOSERVICE_URL, TESSERACT_URL} from "@/lib/api/tesseract";
import {withWarm, type WarmContext, type WarmRelease, type WarmResponse} from "@/lib/api/warm-scope";
import {hash, planGroupKeys, type PlannedGroup} from "@/lib/cache/generator-cache";
import {redisClient} from "@/lib/cache/redis";
import {TTL_MS} from "@/lib/cache/store";
import {getMember, getProfile, type MemberRow} from "@/lib/dimensions/db";
import {planReport, upstreamUrlOf, type ReportPlan} from "@/lib/reports/engine";
import {engineInputs, loadEngine} from "@/lib/reports/load";
import type {Variables} from "@/lib/reports/types";
import {PHASES, type GroupJob, type GroupStats, type Phase, type ShapeRecord, type ToCoordinator, type ToWorker, type UpstreamKind, type WorkerConfig} from "@/lib/cache/batch-warm/protocol";
import {allUrl, batchUrl, canonical, chunkIds, cubeOf, filterByList, firstDifference, getParam, idColumn, listRef, memberRef, membersWithRows, normId, presenceUrl, tiedMembers, unionUrl, unsafeMembers, missingLevels, parseUrl, pathOf, splitBatch, strategiesFor, type ListRef, type MemberRef, type SplitSpec, type Strategy} from "@/lib/cache/batch-warm/shapes";

const MARKER_PREFIX = "warm:done:";
/**
 * Off: members whose rows tie on the sort column are always fetched alone. With it on, the gate
 * kept ties after two tied members matched, but another member then split differently (2026-11-04
 * smoke test: generator 652, Stonewall OK, two income brackets at 29 households): Tesseract does not
 * order tied rows the same way in a batch and alone.
 */
const KEEP_TIES = false;
const TESS_HOST = new URL(TESSERACT_URL).host;
const GEO_PARENT = /(^|[^A-Za-z0-9]|%3A|%2C)(04000US|05000US|16000US|31000US|79500US|50000US|97000US|31200US|31100US)[0-9A-Z]*/;

let config: WorkerConfig;
let cubeLevels = new Map<string, Set<string>>();
let seq = 0;
const pending = new Map<number, (reply: ToWorker) => void>();

function send(msg: ToCoordinator) {
  process.send!(msg);
}

function call<T extends ToWorker>(msg: ToCoordinator & {id: number}): Promise<T> {
  return new Promise(resolve => {
    pending.set(msg.id, reply => resolve(reply as T));
    send(msg);
  });
}

const isTesseract = (url: string) => {
  try {
    return new URL(url).host === TESS_HOST;
  }
  catch {
    return false;
  }
};
const isGeoservice = (url: string) => url.startsWith(GEOSERVICE_URL);

/**
 * The run's slot for a request the scope did not answer: Tesseract under the global cap, the
 * geoservice under the run's geoservice rate (it blocks a client that sends too many), anything
 * else under the worker's own limiter.
 */
const runSlot = (url: string, kind: UpstreamKind, level: string) =>
  isTesseract(url) ? slot(url, kind, {level, members: 1}) : isGeoservice(url) ? slot(url, "geo", {level, members: 1}) : null;

/** A global-cap slot for one Tesseract request; resolves with the function that frees it. */
async function slot(url: string, kind: UpstreamKind, meta: {level: string; members: number; batchId?: string}): Promise<WarmRelease> {
  const id = ++seq;
  const reply = await call<ToWorker>({t: "acq", id, url, kind});
  if (reply.t === "deny") throw new Error(reply.reason);
  return outcome => send({t: "rel", id, url, kind, cube: cubeOf(url), level: meta.level, members: meta.members, batchId: meta.batchId, ...outcome});
}

/** A Tesseract request from the worker itself (batches, verification, singles), under the global cap. */
async function upstream(url: string, kind: UpstreamKind, meta: {level: string; members: number; batchId?: string}): Promise<{status: number; body: string; ms: number; error?: string}> {
  const release = await slot(url, kind, meta);
  const started = performance.now();
  const controller = new AbortController();
  // `complexity/` and `calcs/` queries take 10–50 s on their own
  const timer = setTimeout(() => controller.abort(), /\/(complexity|calcs)\//.test(url) ? config.fetchTimeoutMs * 3 : config.fetchTimeoutMs);
  let status = 0;
  let body = "";
  let error: string | undefined;
  try {
    const res = await fetch(url, {signal: controller.signal, headers: {accept: "application/json"}, cache: "no-store"});
    status = res.status;
    body = await res.text();
  }
  catch (e) {
    error = controller.signal.aborted ? "timeout" : (e as Error).message;
  }
  finally {
    clearTimeout(timer);
  }
  const ms = performance.now() - started;
  release({status, ms, bytes: body.length, error});
  return {status, body, ms, error};
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({length: Math.min(limit, items.length)}, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }));
  return out;
}

/** How one logical URL of a report was served. */
interface Logical {
  url: string;
  kind: "member" | "shared" | "parent";
  cube: string | null;
  gens: number[];
  served: string;
  status: number;
  shape?: string;
}

interface Item {
  id: string;
  member: MemberRow;
  attrs: Variables;
  plan: ReportPlan;
  keyed: PlannedGroup[];
  planHash: string;
  /** Upstream Tesseract URLs of the plan with their generators. */
  urls: Map<string, Logical>;
  /** Responses held for this member's render. */
  held: Map<string, WarmResponse>;
}

/** Responses of shared and parent URLs kept across groups (bounded). */
const sharedCache = new Map<string, WarmResponse>();
let sharedBytes = 0;
/** Set from the run config (`--worker-shared-mb`); 128 MB until the config arrives. */
let SHARED_BUDGET = 128 * 1024 * 1024;

function keepShared(url: string, response: WarmResponse) {
  if (sharedCache.has(url)) return;
  sharedCache.set(url, response);
  sharedBytes += response.body.length;
  for (const [k, v] of sharedCache) {
    if (sharedBytes <= SHARED_BUDGET) break;
    sharedCache.delete(k);
    sharedBytes -= v.body.length;
  }
}

/** Learnt failures for levels a cube lacks, by skip key. */
const skipTemplates = new Map<string, WarmResponse | null>();
/** Shapes known in this worker. */
const shapes = new Map<string, ShapeRecord>();
let batchSeq = 0;

function skipKey(url: string, missing: string[]): string {
  const parsed = parseUrl(url);
  return JSON.stringify([pathOf(url), cubeOf(url), missing, getParam(parsed, "measures") ?? ""]);
}

/** A shape is verified per member level: the same URL can take a state id in one report and a county id in another. */
function shapeKey(profile: string, level: string, shape: string): string {
  return hash(`${profile}|${level}|${shape}`);
}

const isLevelError = (status: number, body: string, missing: string[]) =>
  status === 400 && missing.some(level => body.includes(`Could not find a Level named '${level}'`));

/** The failure for a URL naming a missing level, learnt once per skip key. */
async function skipTemplate(key: string, url: string, missing: string[], level: string): Promise<{template: WarmResponse | null; learnt?: {status: number; body: string}}> {
  if (skipTemplates.has(key)) return {template: skipTemplates.get(key)!};
  const reply = await call<Extract<ToWorker, {t: "skipRes"}>>({t: "skip", id: ++seq, key});
  if (!reply.learn) {
    skipTemplates.set(key, reply.template);
    return {template: reply.template};
  }
  const res = await upstream(url, "learn", {level, members: 1});
  const ok = isLevelError(res.status, res.body, missing);
  const template = ok ? {status: res.status, body: res.body} : null;
  skipTemplates.set(key, template);
  send({t: "skipDone", key, template, reason: ok ? `HTTP 400: Could not find a Level named ${missing.map(m => `'${m}'`).join(", ")}` : `answered ${res.status || res.error}, not a missing-level error`});
  return {template, learnt: {status: res.status, body: res.body}};
}

/**
 * A Tesseract read the plan could not list (inside in-process endpoints or attribute lookups).
 * Without the member id it is shared: fetched once per run through the coordinator. With it, it is
 * fetched by the render (and kept for the rest of that render).
 */
function sharedLookup(url: string, memberId: string, level: string, counter: {shared: number; parent: number}): WarmResponse | undefined | Promise<WarmResponse | undefined> {
  if (!(isTesseract(url) || isGeoservice(url)) || url.includes(memberId) || url.includes(encodeURIComponent(memberId))) return undefined;
  const cached = sharedCache.get(url);
  if (cached) return cached;
  const kind = GEO_PARENT.test(url) ? "parent" : "shared";
  const fetchShared = () => call<Extract<ToWorker, {t: "sharedRes"}>>({t: "shared", id: ++seq, url, kind, level}).then(reply => {
    if (reply.response) keepShared(url, reply.response);
    counter[kind]++;
    return reply.response ?? undefined;
  });
  // a list the planner could not see (a university's CIP2 codes, computed by an in-process
  // endpoint): answered from the query for every member of the level, filtered locally
  if (kind === "shared" && isTesseract(url)) {
    const ref = listRef(url);
    const all = ref ? allUrl(url) : null;
    if (ref && all) return fromAll(url, ref, all, level).then(r => r ?? fetchShared());
  }
  return fetchShared();
}

/** Per "all members" query: how many real responses its filter matched, or rejected. */
const allShapes = new Map<string, {matched: number; rejected: boolean}>();
/** Parsed "all members" responses (a few, a few MB each). */
const allParsed = new Map<string, Record<string, unknown>>();

/**
 * A list query answered from the query without the list (`allUrl`), filtered to the list. The
 * first two answers per query are compared with the real responses (the gate) and the real ones
 * are used; after two matches the filtered answer is used, unless its rows tie on the sort column
 * or it has no rows. A mismatch rejects the query for the run.
 */
async function fromAll(url: string, ref: ListRef, all: string, level: string): Promise<WarmResponse | undefined> {
  let st = allShapes.get(all);
  if (!st) allShapes.set(all, st = {matched: 0, rejected: false});
  if (st.rejected) return undefined;
  const response = await sharedResponse(all, level);
  if (!response || response.status !== 200) return undefined;
  let body = allParsed.get(all);
  if (!body) {
    body = JSON.parse(response.body) as Record<string, unknown>;
    allParsed.set(all, body);
  }
  const mine = filterByList(body, ref.level, ref.values);
  // rows tied on the sort column come in Tesseract's own order: such a list is never answered from
  // the filter, so it can't prove or disprove the shape either
  const tied = !mine || !Array.isArray(mine.data) || !mine.data.length || hasTies(mine, url);
  if (tied) return undefined;
  if (st.matched < 2) {
    const real = await sharedResponse(url, level);
    if (!real || real.status !== 200) return real ?? undefined;
    const expected = JSON.parse(real.body) as Record<string, unknown>;
    const record = (status: "verified" | "rejected", reason: string): ShapeRecord => ({shape: all, cube: cubeOf(all) ?? "", level: ref.level, status, reason, dataChecked: st!.matched, emptyChecked: 0, at: new Date().toISOString()});
    if (mine && canonical(expected) === canonical(mine)) {
      st.matched++;
      if (st.matched === 2) send({t: "shapeDone", key: hash(`all|${all}`), record: record("verified", "list from all members: 2 lists matched their filtered answer")});
    }
    else if (!st.rejected) {
      st.rejected = true;
      send({t: "shapeDone", key: hash(`all|${all}`), record: record("rejected", `list from all members: ${mine ? firstDifference(expected, mine) : "cannot filter"}`)});
    }
    return real;
  }
  const out: WarmResponse = {status: 200, body: JSON.stringify(mine)};
  keepShared(url, out);
  return out;
}

interface ShapeEntry {
  item: Item;
  url: string;
}

interface ShapeGroup {
  key: string;
  shape: string;
  ref: MemberRef;
  cube: string;
  entries: ShapeEntry[];
}

/**
 * The members of `without` (no rows in a batch) that have no data at all. Without `time`, all of
 * them; with it, those also absent from the presence query (the batch without `time`).
 */
async function provenEmpty(sg: ShapeGroup, strategy: Strategy, without: string[], level: string, kind: UpstreamKind): Promise<Set<string>> {
  if (!without.length) return new Set();
  if (!strategy.time) return new Set(without);
  const res = await upstream(presenceUrl(sg.shape, sg.ref, without, strategy), kind, {level, members: without.length, batchId: `w${config.workerIndex}-p${++batchSeq}`});
  if (res.error || res.status !== 200) return new Set();
  const seen = membersWithRows(JSON.parse(res.body) as Record<string, unknown>, sg.ref.level);
  return new Set(without.filter(id => !seen.has(normId(id))));
}

/** The verification gate: compares split responses with single responses of the same members. */
async function verifyShape(sg: ShapeGroup, strategies: Strategy[], level: string, phases: Record<Phase, number>): Promise<{record: ShapeRecord; batch?: {strategy: Strategy; ids: string[]; body: Record<string, unknown>; batchId: string; noData: Set<string>}}> {
  const started = performance.now();
  const singles = new Map<string, {status: number; body: string}>();
  const single = async (entry: ShapeEntry) => {
    let s = singles.get(entry.item.id);
    if (!s) {
      const res = await upstream(entry.url, "verify", {level, members: 1});
      s = {status: res.error ? 0 : res.status, body: res.body};
      singles.set(entry.item.id, s);
      const logical = entry.item.urls.get(entry.url);
      if (logical) logical.status = s.status;
      if (res.status === 200 && !res.error) {
        entry.item.held.set(entry.url, {status: 200, body: res.body});
        if (logical) logical.served = "single (verification)";
      }
    }
    return s;
  };
  const reasons: string[] = [];
  const shapeLevel = sg.ref.level;
  const base = {shape: sg.shape, cube: sg.cube, level: shapeLevel, dataChecked: 0, emptyChecked: 0, at: new Date().toISOString()};
  try {
    for (const strategy of strategies) {
      // the largest members first: they have data, so the gate can compare real rows
      const z = (e: ShapeEntry) => e.item.member.zvalue ?? -1e18;
      const ids = [...sg.entries].sort((a, b) => z(b) - z(a)).map(e => e.item.id);
      const chunk = chunkIds(sg.shape, sg.ref, ids, strategy, config.maxUrlLength, config.maxIds)[0];
      const batchId = `w${config.workerIndex}-b${++batchSeq}`;
      const res = await upstream(batchUrl(sg.shape, sg.ref, chunk, strategy), "verify", {level, members: chunk.length, batchId});
      if (res.error || res.status !== 200) {
        const transient = Boolean(res.error) || res.status >= 500 || res.status === 414;
        return {record: {...base, status: "rejected", reason: `batch ${res.error ?? `HTTP ${res.status}`}: ${res.body.slice(0, 120)}`, transient}};
      }
      const body = JSON.parse(res.body) as Record<string, unknown>;
      const rows = Array.isArray(body.data) ? body.data as unknown[] : [];
      const idCol = idColumn(body, shapeLevel);
      if (rows.length && !idCol) return {record: {...base, status: "rejected", reason: `no ${shapeLevel} id column in the batch`}};
      const present = membersWithRows(body, shapeLevel);
      const unsafe = unsafeMembers(body, shapeLevel, strategy);
      // members whose rows tie on the sort column (not with `time=…latest.N`, unsafe for other reasons)
      const tied = strategy.sortKey && !(strategy.time && strategy.time.n > 1) ? tiedMembers(body, shapeLevel, strategy) : new Set<string>();
      const byId = new Map(sg.entries.map(e => [e.item.id, e]));
      const withData = chunk.filter(id => present.has(normId(id)) && !unsafe.has(normId(id)));
      const tiedWithData = chunk.filter(id => present.has(normId(id)) && tied.has(normId(id)));
      const without = chunk.filter(id => !present.has(normId(id)));
      // members proven to have no data at all (a `time` shape asks the presence query)
      const noData = await provenEmpty(sg, strategy, without, level, "verify");
      const spread = (list: string[], n: number) => n >= list.length ? list : Array.from({length: n}, (_, i) => list[Math.floor((i * (list.length - 1)) / Math.max(1, n - 1))]);
      const dataPick = Array.from(new Set(spread(withData, Math.min(3, withData.length))));
      const noDataList = chunk.filter(id => noData.has(id));
      const emptyPick = Array.from(new Set(spread(noDataList, Math.min(noDataList.length, Math.max(2, 3 - dataPick.length)))));
      // the expected columns come from a real single response with data
      let spec: ShapeRecord["spec"];
      let dataOk = dataPick.length > 0;
      let failure: string | null = null;
      if (dataPick.length) {
        const firsts = await mapLimit(dataPick, 3, id => single(byId.get(id)!));
        const bad = firsts.findIndex(s => s.status !== 200);
        if (bad >= 0) return {record: {...base, status: "rejected", reason: `single HTTP ${firsts[bad].status} while the batch had rows`}};
        const parsed = firsts.map(s => JSON.parse(s.body) as Record<string, unknown>);
        const columns = Array.isArray(parsed[0].columns) ? parsed[0].columns as string[] : Object.keys((parsed[0].data as Record<string, unknown>[])[0] ?? {});
        spec = {columns, strategy};
        let split: Map<string, Record<string, unknown>>;
        try {
          split = splitBatch(body, shapeLevel, spec);
        }
        catch (e) {
          return {record: {...base, status: "rejected", reason: `split failed: ${(e as Error).message}`}};
        }
        for (let i = 0; i < dataPick.length; i++) {
          const mine = split.get(normId(dataPick[i]));
          if (!mine || canonical(mine) !== canonical(parsed[i])) {
            dataOk = false;
            failure = mine ? firstDifference(parsed[i], mine) : "member missing from the split";
            break;
          }
        }
      }
      if (failure) {
        reasons.push(`${strategy.drill}${strategy.limit !== null ? ` (limit ${strategy.limit} cut locally)` : ""}: ${failure}`);
        continue; // the next strategy, if any
      }
      let checked = dataOk ? dataPick.length : 0;
      // members with tied rows: if their split equals their single response, Tesseract keeps tied
      // rows in the same order in both, and ties stop being a reason to fetch a member alone
      let tieNote = strategy.sortKey ? `; members with rows tied on ${strategy.sortKey} are fetched alone` : "";
      const tiePick = KEEP_TIES ? Array.from(new Set(spread(tiedWithData, Math.min(2, tiedWithData.length)))) : [];
      if (tiePick.length) {
        let tiesOk = false;
        const ts = await mapLimit(tiePick, 2, id => single(byId.get(id)!));
        if (ts.every(s => s.status === 200)) {
          try {
            const parsedT = ts.map(s => JSON.parse(s.body) as Record<string, unknown>);
            const columnsT = spec?.columns ?? (Array.isArray(parsedT[0].columns) ? parsedT[0].columns as string[] : Object.keys((parsedT[0].data as Record<string, unknown>[])[0] ?? {}));
            const specT: SplitSpec = {columns: columnsT, strategy: {...strategy, tiesOk: true}};
            const splitT = splitBatch(body, shapeLevel, specT);
            tiesOk = tiePick.every((id, i) => {
              const mine = splitT.get(normId(id));
              return Boolean(mine) && canonical(mine) === canonical(parsedT[i]);
            });
            if (tiesOk) {
              spec = specT;
              if (!dataOk) {
                dataOk = true;
                checked = tiePick.length;
              }
            }
          }
          catch {
            tiesOk = false;
          }
        }
        tieNote = tiesOk ? `; ${tiePick.length} with rows tied on ${strategy.sortKey} matched: ties are kept` : `; members with rows tied on ${strategy.sortKey} are fetched alone`;
      }
      // the empty response: two real singles must agree, with no rows
      let empty: ShapeRecord["empty"];
      let emptyChecked = 0;
      let emptyNote = "";
      if (emptyPick.length) {
        const empties = await mapLimit(emptyPick, 3, id => single(byId.get(id)!));
        const texts = empties.map(s => {
          if (s.status !== 200) return null;
          const b = JSON.parse(s.body) as Record<string, unknown>;
          return Array.isArray(b.data) && b.data.length === 0 ? canonical(b) : null;
        });
        if (texts.every(t => t !== null) && texts.every(t => t === texts[0])) {
          emptyChecked = texts.length;
          if (texts.length >= 2) empty = {status: 200, body: empties[0].body};
          else emptyNote = "; one member without data in the group, empty response not verified yet";
        }
        else {
          const odd = empties.find(s => s.status !== 200);
          const rowsInSingle = texts.some(t => t === null) && !odd;
          if (rowsInSingle) {
            // a member absent from the batch has rows alone: the batch loses data
            return {record: {...base, status: "rejected", reason: "a member missing from the batch has rows in its single response"}};
          }
          emptyNote = odd ? `; members without data answer HTTP ${odd.status} alone: they are fetched singly` : "; empty responses differ: members without data are fetched singly";
        }
      }
      if (strategy.time) emptyNote += "; members without rows are looked up in a presence query (time=…)";
      emptyNote += tieNote;
      if (!dataOk && !empty) {
        return {record: {...base, status: "rejected", reason: `no member with data to verify the split${emptyNote}`, transient: true}};
      }
      // about 4 MB per batched response
      const batchIds = Math.max(10, Math.min(config.maxIds, Math.floor((4 * 1024 * 1024) / Math.max(1, res.body.length / chunk.length))));
      const record: ShapeRecord = {
        ...base, status: "verified", spec: dataOk ? spec : undefined, empty, dataChecked: checked, emptyChecked, batchIds,
        reason: `${strategy.drill}${strategy.limit !== null ? `, limit ${strategy.limit} cut locally` : ""}${strategy.top ? ", top per member" : ""}: ${dataOk ? `${checked} with data` : "no member with data"}${emptyChecked ? `, ${emptyChecked} empty` : ""} matched${emptyNote}${reasons.length ? `; before: ${reasons.join("; ")}` : ""}`
      };
      return {record, batch: {strategy, ids: chunk, body, batchId, noData}};
    }
    return {record: {...base, status: "rejected", reason: reasons.join("; ") || "no strategy"}};
  }
  finally {
    phases.verify += (performance.now() - started) / 1000;
  }
}

/**
 * Assigns a batched response's split to the members of a chunk: members with rows get their split
 * (unless unsafe: ties, missing periods), members proven to have no data get the verified empty
 * response; the others are left for single queries.
 */
function assignSplit(sg: ShapeGroup, record: ShapeRecord, ids: string[], body: Record<string, unknown>, batchId: string, noData: Set<string>): number {
  const byId = new Map(sg.entries.map(e => [e.item.id, e]));
  let assigned = 0;
  let split = new Map<string, Record<string, unknown>>();
  let unsafe = new Set<string>();
  if (record.spec) {
    split = splitBatch(body, sg.ref.level, record.spec);
    unsafe = unsafeMembers(body, sg.ref.level, record.spec.strategy);
  }
  else if (Array.isArray(body.data) && body.data.length) return 0; // rows we cannot split yet: singles
  for (const id of ids) {
    const entry = byId.get(id);
    if (!entry || entry.item.held.has(entry.url)) continue;
    const logical = entry.item.urls.get(entry.url)!;
    const mine = split.get(normId(id));
    if (mine && !unsafe.has(normId(id))) {
      entry.item.held.set(entry.url, {status: 200, body: JSON.stringify(mine)});
      logical.served = `batch ${batchId}`;
      logical.status = 200;
      assigned++;
    }
    else if (!mine && record.empty && noData.has(id)) {
      entry.item.held.set(entry.url, record.empty);
      logical.served = `batch ${batchId} (empty)`;
      logical.status = 200;
      assigned++;
    }
  }
  return assigned;
}

interface PreparedShape {
  sg: ShapeGroup;
  record?: ShapeRecord;
  strategies: Strategy[];
  /** Members the verification batch covered: those it did not answer go single. */
  covered: Set<string>;
}

/** Pass 1: the shape's record, from this worker, the coordinator, Redis, or the gate run now. */
async function prepareShape(sg: ShapeGroup, groupLevel: string, phases: Record<Phase, number>): Promise<PreparedShape> {
  const {strategies, reason} = strategiesFor(sg.shape, sg.ref);
  const covered = new Set<string>();
  if (!strategies.length) {
    if (!shapes.has(sg.key)) {
      const record: ShapeRecord = {shape: sg.shape, cube: sg.cube, level: sg.ref.level, status: "rejected", reason: reason!, dataChecked: 0, emptyChecked: 0, at: new Date().toISOString()};
      shapes.set(sg.key, record);
      send({t: "shapeDone", key: sg.key, record});
    }
    return {sg, strategies, covered, record: shapes.get(sg.key)};
  }
  let record = shapes.get(sg.key);
  if (!record || record.transient) {
    const reply = await call<Extract<ToWorker, {t: "shapeRes"}>>({t: "shape", id: ++seq, key: sg.key, shape: sg.shape, cube: sg.cube, level: sg.ref.level});
    record = reply.record ?? undefined;
    if (reply.verify) {
      const verified = await verifyShape(sg, strategies, groupLevel, phases);
      record = verified.record;
      send({t: "shapeDone", key: sg.key, record});
      const first = verified.batch;
      if (first) {
        first.ids.forEach(id => covered.add(id));
        if (record.status === "verified") {
          const assigned = assignSplit(sg, record, first.ids, first.body, first.batchId, first.noData);
          send({t: "shapeUse", key: sg.key, members: assigned, batches: 1, level: groupLevel, batchSize: first.ids.length});
        }
      }
    }
    if (record) shapes.set(sg.key, record);
  }
  return {sg, record, strategies, covered};
}

/** Pass 2: batched queries for the members of a verified shape not answered yet. */
async function batchShape(prepared: PreparedShape, groupLevel: string, phases: Record<Phase, number>) {
  const {sg, strategies, covered} = prepared;
  let record = prepared.record;
  if (!record || record.status !== "verified") return;
  const todo = sg.entries.filter(e => !e.item.held.has(e.url) && !covered.has(e.item.id));
  if (todo.length < 2) return; // one member: a single query
  const strategy = record.spec?.strategy ?? strategies[0];
  const chunks = chunkIds(sg.shape, sg.ref, todo.map(e => e.item.id), strategy, config.maxUrlLength, record.batchIds ?? config.maxIds);
  let members = 0;
  let batches = 0;
  await mapLimit(chunks, 4, async ids => {
    const batchId = `w${config.workerIndex}-b${++batchSeq}`;
    const res = await upstream(batchUrl(sg.shape, sg.ref, ids, strategy), "batch", {level: groupLevel, members: ids.length, batchId});
    batches++;
    if (res.error || res.status !== 200) return; // these members are fetched singly
    const body = JSON.parse(res.body) as Record<string, unknown>;
    if (!record!.spec && Array.isArray(body.data) && body.data.length) {
      // rows the record cannot split yet: verify with members that have data, then use this batch
      const sub: ShapeGroup = {...sg, entries: sg.entries.filter(e => ids.includes(e.item.id))};
      const again = await verifyShape(sub, [strategy], groupLevel, phases);
      if (again.record.status === "verified" && again.record.spec) {
        record = {...record!, spec: again.record.spec, dataChecked: again.record.dataChecked, reason: `${record!.reason}; data verified later: ${again.record.reason}`};
        shapes.set(sg.key, record);
        send({t: "shapeDone", key: sg.key, record});
      }
      else {
        if (again.record.status === "rejected" && !again.record.transient) {
          record = {...again.record, reason: `rejected when data first appeared: ${again.record.reason}`};
          shapes.set(sg.key, record);
          send({t: "shapeDone", key: sg.key, record});
        }
        return;
      }
    }
    const present = membersWithRows(body, sg.ref.level);
    const missing = ids.filter(id => !present.has(normId(id)));
    const noData = record!.empty ? await provenEmpty(sg, strategy, missing, groupLevel, "batch") : new Set<string>();
    members += assignSplit(sg, record!, ids, body, batchId, noData);
  });
  send({t: "shapeUse", key: sg.key, members, batches, level: groupLevel, batchSize: Math.max(...chunks.map(c => c.length))});
}

/** List shapes known in this worker: verified (served from a union) or rejected. */
const listShapes = new Map<string, "verified" | "rejected">();

/** The shared response of a URL through the coordinator (fetched once per run), kept locally. */
async function sharedResponse(url: string, level: string): Promise<WarmResponse | null> {
  const cached = sharedCache.get(url);
  if (cached) return cached;
  const reply = await call<Extract<ToWorker, {t: "sharedRes"}>>({t: "shared", id: ++seq, url, kind: "shared", level});
  if (reply.response) keepShared(url, reply.response);
  return reply.response;
}

/** Rows of a filtered answer that tie on the sort column: their order may differ alone. */
function hasTies(body: Record<string, unknown>, url: string): boolean {
  const raw = getParam(parseUrl(url), "sort");
  if (raw === undefined) return false;
  const key = decodeURIComponent(raw.replace(/\+/g, " ")).replace(/\.(asc|desc)$/i, "");
  const rows = Array.isArray(body.data) ? body.data as Record<string, unknown>[] : [];
  const values = rows.map(r => JSON.stringify(Array.isArray(r) ? null : r[key]));
  return new Set(values).size !== values.length;
}

/**
 * Shared URLs that differ only by a list of members in `include` (`listRef`): one query for the
 * union of the lists, filtered to each list. A shape is used once two real responses equal their
 * filtered answer (the gate); URLs it cannot answer safely (ties on the sort column, no rows) are
 * left to the shared fetch.
 */
async function answerListShapes(urls: string[], profile: string, level: string) {
  const groups = new Map<string, {ref: ListRef; urls: {url: string; ref: ListRef}[]}>();
  for (const url of urls) {
    const ref = listRef(url);
    if (!ref) continue;
    let g = groups.get(ref.shape);
    if (!g) groups.set(ref.shape, g = {ref, urls: []});
    g.urls.push({url, ref});
  }
  await mapLimit(Array.from(groups.values()).filter(g => g.urls.length >= 3), 4, async g => {
    const key = hash(`list|${profile}|${level}|${g.ref.shape}`);
    if (listShapes.get(key) === "rejected") return;
    const union = Array.from(new Set(g.urls.flatMap(u => u.ref.values))).sort();
    const target = unionUrl(g.ref, union);
    if (target.length > config.maxUrlLength) return;
    const res = await upstream(target, "shared", {level, members: g.urls.length, batchId: `w${config.workerIndex}-u${++batchSeq}`});
    if (res.error || res.status !== 200) return;
    const body = JSON.parse(res.body) as Record<string, unknown>;
    const filtered = (ref: ListRef) => filterByList(body, ref.level, ref.values);
    if (!listShapes.has(key)) {
      // the gate: the two lists with the most members, compared with their real responses
      const picks = [...g.urls].sort((a, b) => b.ref.values.length - a.ref.values.length).slice(0, 2);
      let ok = true;
      let reason = "";
      for (const p of picks) {
        const real = await sharedResponse(p.url, level);
        const mine = filtered(p.ref);
        if (!real || real.status !== 200 || !mine) { ok = false; reason = real ? `single HTTP ${real.status}` : "single failed"; break; }
        const expected = JSON.parse(real.body) as Record<string, unknown>;
        if (canonical(expected) !== canonical(mine)) { ok = false; reason = firstDifference(expected, mine); break; }
      }
      listShapes.set(key, ok ? "verified" : "rejected");
      send({t: "shapeDone", key, record: {shape: g.ref.shape, cube: cubeOf(g.ref.shape) ?? "", level: g.ref.level, status: ok ? "verified" : "rejected", reason: ok ? `list shape: ${picks.length} lists matched their filtered union` : `list shape: ${reason}`, dataChecked: ok ? picks.length : 0, emptyChecked: 0, at: new Date().toISOString()}});
      if (!ok) return;
    }
    for (const u of g.urls) {
      if (sharedCache.has(u.url)) continue;
      const mine = filtered(u.ref);
      if (!mine || !Array.isArray(mine.data) || !mine.data.length || hasTies(mine, u.url)) continue;
      keepShared(u.url, {status: 200, body: JSON.stringify(mine)});
    }
  });
}

function appendJsonl(file: string, rows: unknown[]) {
  if (!rows.length) return;
  appendFileSync(join(config.outDir, file), rows.map(r => JSON.stringify(r)).join("\n") + "\n");
}

/** Aggregated shared and parent URLs of this worker, written at the end. */
const sharedLogical = new Map<string, {url: string; kind: string; cube: string | null; levels: Set<string>; gens: Set<number>; reports: number; served: string; status: number}>();

async function runGroup(job: GroupJob): Promise<GroupStats> {
  const phases = Object.fromEntries(PHASES.map(p => [p, 0])) as Record<Phase, number>;
  const stats: GroupStats = {gid: job.gid, profile: job.profile, hierarchy: job.hierarchy, reports: job.ids.length, fullHits: 0, rendered: 0, incomplete: 0, errors: 0, generators: 0, stored: 0, hits: 0, phases, served: {}, oldRequests: 0};
  const profile = getProfile(job.profile);
  if (!profile) throw new Error(`unknown profile ${job.profile}`);
  const level = job.hierarchy;
  const client = redisClient();
  const enter = (phase: Phase, items: number) => send({t: "phase", gid: job.gid, phase, items});

  // 1. plan: attributes, the render's own plan, and the reports already complete
  enter("plan", job.ids.length);
  let t = performance.now();
  const unplanned = {shared: 0, parent: 0};
  // attribute lookups without the member id (a parent's population...) are fetched once per run
  // what the attributes fetched for a member is kept for its render (generators 23 and 59 read the
  // same geoservice URLs as the attributes)
  const attrsFetched = new Map<string, Map<string, WarmResponse>>();
  const attrsContext = (id: string): WarmContext => ({
    lookup: url => attrsFetched.get(id)?.get(url) ?? sharedLookup(url, id, level, unplanned),
    acquire: url => runSlot(url, "attrs", level),
    keep: (url, response) => {
      if (!attrsFetched.has(id)) attrsFetched.set(id, new Map());
      attrsFetched.get(id)!.set(url, response);
    }
  });
  const planned = await mapLimit(job.ids, 16, async (id): Promise<Item | null> => {
    const member = getMember(profile.dimension, id);
    if (!member) return null;
    const {attrs, template} = await withWarm(attrsContext(id), () => engineInputs(job.profile, member));
    const plan = planReport(template, attrs);
    const keyed = planGroupKeys(attrs, plan.groups);
    const planHash = hash(keyed.map(k => k.keys.join(",")).join("|"));
    const held = new Map(attrsFetched.get(id) ?? []);
    attrsFetched.delete(id);
    return {id, member, attrs, plan, keyed, planHash, urls: new Map(), held};
  });
  let items = planned.filter((x): x is Item => Boolean(x));
  stats.oldRequests = items.reduce((n, item) => n + item.plan.groups.filter(g => {
    const u = upstreamUrlOf(g.url);
    return u && isTesseract(u);
  }).length, 0);
  if (!config.force && client) {
    const pipeline = client.pipeline();
    for (const item of items) {
      const keys = item.keyed.flatMap(k => k.keys.filter((x): x is string => Boolean(x)));
      pipeline.get(`${MARKER_PREFIX}${job.profile}|${item.id}`);
      pipeline.exists(...(keys.length ? keys : ["__none__"]));
    }
    const replies = await pipeline.exec();
    const skip = new Set<string>();
    items.forEach((item, i) => {
      const marker = replies?.[2 * i]?.[1] as string | null;
      const present = Number(replies?.[2 * i + 1]?.[1] ?? 0);
      const keys = item.keyed.flatMap(k => k.keys.filter((x): x is string => Boolean(x)));
      if (present === keys.length) { skip.add(item.id); return; }
      if (marker) {
        const m = JSON.parse(marker) as {h: string; stored: number};
        if (m.h === item.planHash && present >= m.stored) skip.add(item.id);
      }
    });
    stats.fullHits = skip.size;
    items = items.filter(item => !skip.has(item.id));
  }
  phases.plan += (performance.now() - t) / 1000;
  if (!items.length) return stats;

  // classify every Tesseract URL of the plans
  const shapeGroups = new Map<string, ShapeGroup>();
  const sharedUrls = new Map<string, {kind: "shared" | "parent"; items: Item[]}>();
  const skipCandidates: {item: Item; url: string; missing: string[]}[] = [];
  // geoservice URLs of generators (intersects, neighbors): fetched before the render, so no render
  // waits on the geoservice
  const geoSingles: {item: Item; l: Logical}[] = [];
  for (const item of items) {
    for (const group of item.plan.groups) {
      const url = upstreamUrlOf(group.url);
      if (url && isGeoservice(url) && !item.held.has(url) && !item.urls.has(url)) {
        const l: Logical = {url, kind: url.includes(item.id) ? "member" : "parent", cube: null, gens: group.generators.map(g => g.id), served: "geo", status: 0};
        item.urls.set(url, l);
        geoSingles.push({item, l});
        continue;
      }
      if (!url || !isTesseract(url)) continue;
      const gens = group.generators.map(g => g.id);
      const existing = item.urls.get(url);
      if (existing) {
        existing.gens.push(...gens);
        continue;
      }
      const cube = cubeOf(url);
      const ref = memberRef(url, item.id);
      const logical: Logical = {url, kind: ref.ref ? "member" : "shared", cube, gens, served: "single", status: 0};
      item.urls.set(url, logical);
      if (item.held.has(url)) {
        // the attributes already read it
        logical.served = "attrs";
        logical.status = item.held.get(url)!.status;
        if (!ref.ref && ref.reason === null) logical.kind = GEO_PARENT.test(url.replace(item.id, "")) ? "parent" : "shared";
        continue;
      }
      const missing = missingLevels(url, cubeLevels);
      if (missing.length) skipCandidates.push({item, url, missing});
      if (ref.ref) {
        logical.shape = ref.ref.shape;
        if (config.noBatch) continue;
        const key = shapeKey(job.profile, level, ref.ref.shape);
        let sg = shapeGroups.get(key);
        if (!sg) shapeGroups.set(key, sg = {key, shape: ref.ref.shape, ref: ref.ref, cube: cube ?? "", entries: []});
        sg.entries.push({item, url});
      }
      else if (ref.reason === null) {
        logical.kind = GEO_PARENT.test(url.replace(item.id, "")) ? "parent" : "shared";
        let s = sharedUrls.get(url);
        if (!s) sharedUrls.set(url, s = {kind: logical.kind, items: []});
        s.items.push(item);
      }
    }
  }

  // 2. levels the cube does not have
  enter("skip", skipCandidates.length);
  t = performance.now();
  const skipped = new Set<string>(); // `${item.id} ${url}`
  await mapLimit(skipCandidates, 8, async ({item, url, missing}) => {
    const {template, learnt} = await skipTemplate(skipKey(url, missing), url, missing, level);
    const logical = item.urls.get(url)!;
    if (template) {
      item.held.set(url, template);
      if (learnt) logical.served = "single (learnt the skip)";
      else {
        logical.served = "skipped";
        skipped.add(`${item.id} ${url}`);
      }
      logical.status = template.status;
    }
    else if (learnt && learnt.status === 200) {
      item.held.set(url, {status: 200, body: learnt.body});
      logical.served = "single";
      logical.status = 200;
    }
  });
  phases.skip += (performance.now() - t) / 1000;

  // 3. shared and parent URLs, once per run (the coordinator holds them)
  enter("shared", sharedUrls.size);
  t = performance.now();
  await answerListShapes(Array.from(sharedUrls.keys()).filter(url => !sharedCache.has(url)), job.profile, level);
  await mapLimit(Array.from(sharedUrls), config.fetchConcurrency, async ([url, {kind, items: users}]) => {
    const pendingUsers = users.filter(u => !u.held.has(url));
    if (!pendingUsers.length) return;
    let response = sharedCache.get(url) ?? null;
    if (!response) {
      const reply = await call<Extract<ToWorker, {t: "sharedRes"}>>({t: "shared", id: ++seq, url, kind, level});
      response = reply.response;
      if (response) keepShared(url, response);
    }
    for (const u of pendingUsers) {
      const logical = u.urls.get(url)!;
      if (response) {
        u.held.set(url, response);
        logical.served = kind;
        logical.status = response.status;
      }
      else logical.served = `${kind} failed: single`;
    }
  });
  phases.shared += (performance.now() - t) / 1000;

  // 4. verified shapes: the gate for shapes not seen yet (pass 1), then batched queries (pass 2)
  t = performance.now();
  const open = Array.from(shapeGroups.values())
    .map(sg => ({...sg, entries: sg.entries.filter(e => !e.item.held.has(e.url))}))
    .filter(sg => sg.entries.length >= 2); // one member: a single query
  enter("verify", open.length);
  const prepared = await mapLimit(open, 24, async sg => {
    try {
      return await prepareShape(sg, level, phases);
    }
    catch (error) {
      send({t: "error", gid: job.gid, message: `shape ${sg.shape}: ${(error as Error).message}`});
      return null;
    }
  });
  phases.verify = (performance.now() - t) / 1000;
  enter("batch", prepared.filter(Boolean).length);
  t = performance.now();
  const verifyBefore = phases.verify;
  await mapLimit(prepared.filter((p): p is PreparedShape => Boolean(p)), 16, async p => {
    try {
      await batchShape(p, level, phases);
    }
    catch (error) {
      send({t: "error", gid: job.gid, message: `batch ${p.sg.shape}: ${(error as Error).message}`});
    }
  });
  // re-verifications inside pass 2 count as verification
  const reverify = phases.verify - verifyBefore;
  phases.batch = Math.max(0, (performance.now() - t) / 1000 - reverify);

  // 5. whatever is left, one URL at a time
  t = performance.now();
  // a URL whose shape's batch answered 4xx (a query Tesseract refuses, like "Multiple Hierarchies")
  // fails alone too: the render fetches it once, as today, instead of a prefetch plus the render
  const refused = (l: Logical) => {
    if (!l.shape) return false;
    const record = shapes.get(shapeKey(job.profile, level, l.shape));
    return Boolean(record && record.status === "rejected" && /^batch HTTP 4/.test(record.reason));
  };
  const singles = items.flatMap(item => Array.from(item.urls.values()).filter(l => {
    if (item.held.has(l.url)) return false;
    if (refused(l)) {
      l.served = "single (by the render: the query is refused)";
      return false;
    }
    return true;
  }).map(l => ({item, l}))).filter(({l}) => !isGeoservice(l.url));
  enter("single", singles.length);
  await mapLimit(singles, config.fetchConcurrency, async ({item, l}) => {
    const res = await upstream(l.url, "single", {level, members: 1});
    l.status = res.error ? 0 : res.status;
    if (!res.error && res.status >= 200 && res.status < 300) item.held.set(l.url, {status: res.status, body: res.body});
    else l.served = `${l.served} (failed: fetched again by the render)`;
  });
  phases.single += (performance.now() - t) / 1000;

  // 5b. the geoservice URLs of generators, under the run's geoservice limiter
  enter("geo", geoSingles.length);
  t = performance.now();
  await mapLimit(geoSingles, config.geoConcurrency, async ({item, l}) => {
    if (item.held.has(l.url)) return;
    const res = await upstream(l.url, "geo", {level, members: 1});
    l.status = res.error ? 0 : res.status;
    if (!res.error && res.status >= 200 && res.status < 300) item.held.set(l.url, {status: res.status, body: res.body});
    else l.served = "geo (failed: fetched again by the render)";
  });
  phases.geo += (performance.now() - t) / 1000;

  // 6. render through the real engine; the scope serves what was fetched above
  enter("render", items.length);
  let renderedSoFar = 0;
  t = performance.now();
  const reportRows: unknown[] = [];
  const logicalRows: unknown[] = [];
  await mapLimit(items, config.renderConcurrency, async item => {
    const context: WarmContext = {
      // reads the plan could not list (in-process endpoints, lookups): see `sharedLookup`
      lookup: url => item.held.get(url) ?? sharedLookup(url, item.id, level, unplanned),
      acquire: url => runSlot(url, "fallback", level),
      keep: (url, response) => { if (isTesseract(url) || isGeoservice(url)) item.held.set(url, response); }
    };
    const started = performance.now();
    try {
      const run = await withWarm(context, () => loadEngine(job.profile, item.member, false, {label: "warm"}));
      const d = run.built.diagnostics;
      const cache = d.cache;
      stats.rendered++;
      stats.generators += d.generators.length;
      stats.stored += cache?.stored ?? 0;
      stats.hits += cache?.hits ?? 0;
      if (d.failed.length) stats.incomplete++;
      // outputs now in the cache: the full-hit test of a rerun expects at least these
      const stored = d.generators.filter(g => !g.error && !g.uncached && g.cache !== "off").length;
      if (client && cache?.enabled) {
        await client.set(`${MARKER_PREFIX}${job.profile}|${item.id}`, JSON.stringify({h: item.planHash, stored, at: Date.now()}), "PX", TTL_MS);
      }
      reportRows.push({profile: job.profile, level, id: item.id, slug: item.member.slug, ms: Math.round(performance.now() - started), generators: d.generators.length, failed: d.failed.map(f => `${f.id} ${f.kind}${f.status ? ` ${f.status}` : ""}`), hits: cache?.hits ?? 0, misses: cache?.misses ?? 0, stored: cache?.stored ?? 0, uncached: d.generators.filter(g => g.uncached).map(g => `${g.id}: ${g.uncached}`)});
    }
    catch (error) {
      stats.errors++;
      reportRows.push({profile: job.profile, level, id: item.id, error: (error as Error).message});
    }
    for (const l of item.urls.values()) {
      const servedKind = skipped.has(`${item.id} ${l.url}`) ? "skipped" : l.served;
      stats.served[servedKind.replace(/ w\d+-b\d+/, "")] = (stats.served[servedKind.replace(/ w\d+-b\d+/, "")] ?? 0) + 1;
      if (l.kind === "member") logicalRows.push({url: l.url, kind: l.kind, cube: l.cube, level, gens: l.gens, reports: 1, served: servedKind, status: l.status, shape: l.shape});
      else {
        let agg = sharedLogical.get(l.url);
        if (!agg) sharedLogical.set(l.url, agg = {url: l.url, kind: l.kind, cube: l.cube, levels: new Set(), gens: new Set(), reports: 0, served: l.served, status: l.status});
        agg.levels.add(level);
        l.gens.forEach(g => agg!.gens.add(g));
        agg.reports++;
      }
    }
    item.held.clear(); // member entries are freed as soon as the member is rendered
    renderedSoFar++;
    if (renderedSoFar % 10 === 0 || renderedSoFar === items.length) send({t: "rendered", gid: job.gid, rendered: renderedSoFar, of: items.length});
  });
  phases.render += (performance.now() - t) / 1000;
  if (unplanned.shared || unplanned.parent) {
    stats.served["unplanned shared (render)"] = unplanned.shared;
    stats.served["unplanned parent (render)"] = unplanned.parent;
  }
  appendJsonl(`reports-w${config.workerIndex}.jsonl`, reportRows);
  appendJsonl(`logical-w${config.workerIndex}.jsonl`, logicalRows);
  return stats;
}

function flushShared() {
  const rows = Array.from(sharedLogical.values()).map(r => ({...r, levels: Array.from(r.levels), gens: Array.from(r.gens)}));
  appendJsonl(`logical-shared-w${config.workerIndex}.jsonl`, rows);
  sharedLogical.clear();
}

export function startWorker() {
  // usage for the progress log
  setInterval(() => {
    const u = process.cpuUsage();
    send({t: "usage", rss: process.memoryUsage().rss, heapUsed: process.memoryUsage().heapUsed, cpuUser: u.user, cpuSystem: u.system});
  }, 5000).unref();
  let queue = Promise.resolve();
  process.on("message", (msg: ToWorker) => {
    switch (msg.t) {
      case "init":
        config = msg.config;
        if (config.sharedBudgetMb > 0) SHARED_BUDGET = config.sharedBudgetMb * 1024 * 1024;
        cubeLevels = new Map(msg.config.cubeLevels.map(([cube, levels]) => [cube, new Set(levels)]));
        send({t: "ready"});
        break;
      case "group":
        queue = queue.then(async () => {
          try {
            const stats = await runGroup(msg.job);
            send({t: "groupDone", gid: msg.job.gid, stats});
          }
          catch (error) {
            send({t: "error", gid: msg.job.gid, message: (error as Error).stack ?? String(error)});
            send({t: "groupDone", gid: msg.job.gid, stats: {gid: msg.job.gid, profile: msg.job.profile, hierarchy: msg.job.hierarchy, reports: msg.job.ids.length, fullHits: 0, rendered: 0, incomplete: 0, errors: msg.job.ids.length, generators: 0, stored: 0, hits: 0, phases: Object.fromEntries(PHASES.map(p => [p, 0])) as Record<Phase, number>, served: {}, oldRequests: 0}});
          }
        });
        break;
      case "stop":
        void queue.then(async () => {
          flushShared();
          await redisClient()?.quit().catch(() => {});
          process.exit(0);
        });
        break;
      default: {
        const resolve = pending.get((msg as {id: number}).id);
        if (resolve) {
          pending.delete((msg as {id: number}).id);
          resolve(msg);
        }
      }
    }
  });
}
