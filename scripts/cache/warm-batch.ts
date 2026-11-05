// The batched warmer: fills the generator cache for a list of reports in as few Tesseract queries
// as it can, through the real engine (docs/architecture.md, "Batched warmer"; docs/deployment.md,
// "Warming the whole site").
//
//   NEXT_PUBLIC_TESSERACT_URL=https://api-penn.datausa.io/ REDIS_URL=redis://127.0.0.1:6379 \
//     npm run warm:batch -- --plan plan.json [--out dir] [--workers 4] [--group 300] [--cap 16]
//     [--max-cap 50] [--cap-step 8] [--slow-p95 10000] [--latency-floor 50] [--shared-mb 512] [--worker-shared-mb 128] [--heavy 8] [--render 6] [--fetch 32] [--max-url 6000] [--max-ids 400] [--timeout 60000]
//     [--geo-rate 50] [--geo-concurrency 32] [--force] [--no-batch] [--limit N]
//
// The plan is a JSON array of `{profile, id}` (a `hierarchy` is looked up when missing). Reports are
// processed level by level (states, counties, MSAs, PUMAs, districts, places, then the other
// families), in groups of `--group` members sorted by id, by `--workers` processes. This process
// holds what is global to the run:
// - the cap on concurrent Tesseract requests, from `--cap` (16) up to `--max-cap` (50) while
//   nothing fails, down by 40% (and a 30 s pause after five errors) on two or more 5xx, timeouts or
//   network errors in a 20 s window (a URL that keeps answering 5xx counts once, a 5xx answered
//   within a second not at all). Slow answers alone don't lower it: `pums_5` queries take 6–20 s
//   on an idle server. `complexity/` and `calcs/` queries, 10–60 s each, run in a lane of
//   `--heavy` (8) inside the cap;
// - the responses of URLs shared by many members (national, state, county...), each fetched once;
// - the verified shapes (also in Redis, `warm:shape:<hash>:<cube epoch>`) and the skip templates.
// Rerunning a plan skips the reports that are already a full hit. One run at a time per Redis
// (`warm:batch:lock`).
//
// Output in `--out`: progress.jsonl (one line every 15 s), upstream.jsonl (every Tesseract request
// sent), logical-*.jsonl (every logical URL and how it was served), reports-*.jsonl, shapes.jsonl,
// skips.jsonl, summary.json, workers.log.
import {fork} from "node:child_process";
import {randomUUID} from "node:crypto";
import {createWriteStream, mkdirSync, openSync, readFileSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";
import Redis from "ioredis";
import {DatabaseSync} from "node:sqlite";
import type {GroupJob, GroupStats, ShapeRecord, ToCoordinator, ToWorker, UpstreamKind, WorkerConfig} from "@/lib/cache/batch-warm/protocol";
import type {WarmResponse} from "@/lib/api/warm-scope";

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};

const PLAN = opt("plan", "");
const OUT = resolve(opt("out", "warm-batch-out"));
const WORKERS = Number(opt("workers", "4"));
const GROUP = Number(opt("group", "300"));
const CAP_START = Number(opt("cap", "16"));
const CAP_MAX = Number(opt("max-cap", "50"));
const LIMIT = Number(opt("limit", "0"));
const TESSERACT = (process.env.NEXT_PUBLIC_TESSERACT_URL ?? "").replace(/\/?$/, "/");
const GEOSERVICE = (process.env.GEOSERVICE_URL ?? "https://geoservice.datausa.io/api/").replace(/\/?$/, "/");
const REDIS_URL = process.env.REDIS_URL ?? "";
const HEAVY_MAX = Number(opt("heavy", "8"));
/** How much the cap grows per quiet window. */
const CAP_STEP = Number(opt("cap-step", "8"));
/** Above a cap of 50: a p95 of ordinary queries above this lowers the cap, above half of it stops raising it. */
const SLOW_P95_MS = Number(opt("slow-p95", "10000"));
/** The cap above which latency counts (2026-11-04: at 50–64 in flight, `pums_5` queries queued at 15 s and some timed out). */
const LATENCY_FLOOR = Number(opt("latency-floor", "50"));
const WINDOW_MS = 20_000;
const PROGRESS_MS = 15_000;
const SHAPE_TTL_MS = 30 * 86_400_000;

if (!PLAN || !process.env.NEXT_PUBLIC_TESSERACT_URL || !REDIS_URL) {
  console.error("usage: NEXT_PUBLIC_TESSERACT_URL=... REDIS_URL=... npm run warm:batch -- --plan <file> [options]");
  process.exit(2);
}
mkdirSync(OUT, {recursive: true});

const started = Date.now();
const elapsed = () => (Date.now() - started) / 1000;
const redis = new Redis(REDIS_URL, {maxRetriesPerRequest: 2});
const upstreamLog = createWriteStream(join(OUT, "upstream.jsonl"), {flags: "a"});
const progressLog = createWriteStream(join(OUT, "progress.jsonl"), {flags: "a"});
const events = createWriteStream(join(OUT, "events.jsonl"), {flags: "a"});
const event = (e: Record<string, unknown>) => {
  const line = {t: new Date().toISOString(), elapsedS: Math.round(elapsed()), ...e};
  events.write(JSON.stringify(line) + "\n");
  console.log(`[warm] ${JSON.stringify(line)}`);
};

// ---------------------------------------------------------------------------------------------
// The global cap on Tesseract requests
// ---------------------------------------------------------------------------------------------

interface Sample {ms: number; status: number; error?: string; cube: string | null; url?: string}

/**
 * URLs that already failed with a 5xx: some always do (a `calcs/pums` query for a territory answers
 * 500 every time), and their repeats say nothing about the load on Tesseract.
 */
const failingUrls = new Set<string>();

/**
 * Heavy queries: `complexity/` (RCA) and `calcs/` take 10–50 s each even on an idle server and
 * keep its query engine busy, so a burst of them slows every other query. They get their own
 * lane of `--heavy` inside the cap (never more than half of it).
 */
const isHeavy = (url?: string) => Boolean(url && /\/(complexity|calcs)\//.test(url));

interface Waiter {heavy: boolean; priority: number; go: () => void}

/**
 * Which waiting request goes first: what a render or a plan is blocked on (render fallbacks,
 * attributes), then what a group's batching is blocked on (shared, verification, batches), then the
 * bulk of single queries.
 */
const PRIORITY: Record<string, number> = {fallback: 0, attrs: 0, shared: 1, parent: 1, learn: 1, verify: 1, batch: 1, single: 2};

const limiter = {
  cap: CAP_START,
  inFlight: 0,
  heavyInFlight: 0,
  waiting: [] as Waiter[],
  pausedUntil: 0,
  window: [] as Sample[],
  windowStarted: Date.now(),
  history: [] as {t: number; cap: number; why: string}[],
  totals: {sent: 0, s5xx: 0, timeouts: 0, s4xx: 0},
  heavyCap() {
    return Math.max(2, Math.min(HEAVY_MAX, Math.floor(this.cap / 2)));
  },
  canStart(heavy: boolean) {
    return this.inFlight < this.cap && Date.now() >= this.pausedUntil && (!heavy || this.heavyInFlight < this.heavyCap());
  },
  acquire(url?: string, kind = "shared"): Promise<void> {
    const heavy = isHeavy(url);
    if (!this.waiting.length && this.canStart(heavy)) {
      this.inFlight++;
      if (heavy) this.heavyInFlight++;
      return Promise.resolve();
    }
    const priority = PRIORITY[kind] ?? 1;
    const waiter: Waiter = {heavy, priority, go: () => {
      this.inFlight++;
      if (heavy) this.heavyInFlight++;
      resolve();
    }};
    let resolve!: () => void;
    const promise = new Promise<void>(r => { resolve = r; });
    // after the last waiter of the same or a higher priority: first come, first served within a priority
    let at = this.waiting.length;
    while (at > 0 && this.waiting[at - 1].priority > priority) at--;
    this.waiting.splice(at, 0, waiter);
    return promise;
  },
  release(sample: Sample) {
    this.inFlight--;
    if (isHeavy(sample.url)) this.heavyInFlight--;
    this.window.push(sample);
    this.totals.sent++;
    if (sample.status >= 500 || sample.status === 429) this.totals.s5xx++;
    else if (sample.status >= 400) this.totals.s4xx++;
    if (sample.error === "timeout" || /timed out/.test(sample.error ?? "")) this.totals.timeouts++;
    this.pump();
  },
  pump() {
    // first come, first served, except that a heavy query waiting for its lane lets others pass
    for (let i = 0; i < this.waiting.length && this.inFlight < this.cap && Date.now() >= this.pausedUntil;) {
      const w = this.waiting[i];
      if (this.canStart(w.heavy)) {
        this.waiting.splice(i, 1);
        w.go();
      }
      else i++;
    }
  },
  /**
   * Every window: lower on errors only, raise toward the maximum while all is well. Latency is
   * logged (p95) but doesn't move the cap: a slow query is usually slow by nature, not by load.
   */
  tick() {
    const w = this.window;
    const now = Date.now();
    if (now - this.windowStarted < WINDOW_MS) return;
    this.window = [];
    this.windowStarted = now;
    if (!w.length) return;
    // a 5xx counts once per URL, and not when answered within a second (a query that always fails,
    // like `calcs/pums` for a territory, fails at once); timeouts and network errors always count;
    // 429: the server sheds load, a clear signal to slow down
    // a 5xx from `calcs/` or `complexity/` is the query's own failure (a territory without PUMS
    // data answers 500 after 1–12 s), never counted
    const errors = w.filter(s => s.error || s.status === 429 || (s.status >= 500 && !s.url)).length + w.filter(s => s.status >= 500 && s.url && !s.error && s.ms >= 1000 && !isHeavy(s.url)).reduce((n, s) => {
      if (failingUrls.has(s.url!)) return n;
      failingUrls.add(s.url!);
      return n + 1;
    }, 0);
    const sorted = w.filter(s => !isHeavy(s.url)).map(s => s.ms).sort((a, b) => a - b);
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))] : 0;
    const before = this.cap;
    let why = "";
    if (errors >= 2) {
      this.cap = Math.max(4, Math.floor(this.cap * 0.6));
      why = `${errors} errors (5xx/timeouts/network), p95 ${(p95 / 1000).toFixed(1)} s`;
      if (errors >= 5) {
        this.pausedUntil = now + 30_000;
        why += "; paused 30 s";
        setTimeout(() => this.pump(), 30_500);
      }
    }
    // above `--latency-floor` the cap looks for Tesseract's ceiling, so latency counts there:
    // ordinary queries (not `complexity/`, `calcs/`) slower than SLOW_P95_MS at p95 mean the server
    // is queueing, and the cap steps back toward the floor
    else if (this.cap > LATENCY_FLOOR && p95 > SLOW_P95_MS) {
      this.cap = Math.max(LATENCY_FLOOR, Math.floor(this.cap * 0.8));
      why = `p95 ${(p95 / 1000).toFixed(1)} s above ${SLOW_P95_MS / 1000} s`;
    }
    else if (this.cap < CAP_MAX && w.length >= 20 && (this.waiting.length > 0 || this.inFlight >= this.cap - 1) && (this.cap < LATENCY_FLOOR || p95 <= SLOW_P95_MS / 2)) {
      this.cap = Math.min(CAP_MAX, this.cap + CAP_STEP);
      why = `no errors, p95 ${(p95 / 1000).toFixed(1)} s, ${this.waiting.length} waiting`;
    }
    if (this.cap !== before) {
      this.history.push({t: Math.round(elapsed()), cap: this.cap, why});
      event({cap: this.cap, from: before, why});
      this.pump();
    }
  }
};

/**
 * The geoservice sits behind Cloudflare, whose rate limit answers HTTP 429 to a client sending too
 * many requests (the warm host can be allowlisted). Its requests (attributes, a few generators) get
 * their own limiter: at most `--geo-rate` a second (default 50) and `--geo-concurrency` at a time
 * (default 32). A 429 lowers the rate by a quarter (never below a quarter of `--geo-rate`) and pauses
 * for 5 s; 15 s without one raises it back by a quarter. It never collapses to a crawl: a few 429s
 * among thousands of requests are retried by the render.
 */
const GEO_RATE = Number(opt("geo-rate", "50"));
const GEO_CONCURRENCY = Number(opt("geo-concurrency", "32"));
const geoLimiter = {
  rate: GEO_RATE,
  inFlight: 0,
  waiting: [] as (() => void)[],
  next: 0,
  pausedUntil: 0,
  lastLimited: 0,
  timer: null as ReturnType<typeof setTimeout> | null,
  totals: {sent: 0, limited: 0},
  acquire(): Promise<void> {
    return new Promise(resolve => {
      this.waiting.push(resolve);
      this.pump();
    });
  },
  pump() {
    const now = Date.now();
    while (this.waiting.length && this.inFlight < GEO_CONCURRENCY && now >= this.pausedUntil && now >= this.next) {
      this.inFlight++;
      this.totals.sent++;
      this.next = Math.max(now, this.next) + 1000 / this.rate;
      this.waiting.shift()!();
    }
    if (this.waiting.length && !this.timer) {
      const wait = Math.max(10, Math.max(this.pausedUntil, this.next) - now);
      this.timer = setTimeout(() => { this.timer = null; this.pump(); }, wait);
    }
  },
  release(status: number) {
    this.inFlight--;
    const now = Date.now();
    if (status === 429) {
      this.totals.limited++;
      if (now - this.lastLimited > 5000) {
        this.rate = Math.max(GEO_RATE / 4, this.rate * 0.75);
        this.pausedUntil = now + 5_000;
        setTimeout(() => this.pump(), 5_100);
        event({geoservice: "429", rate: Math.round(this.rate * 10) / 10, paused: "5 s"});
      }
      this.lastLimited = now;
    }
    else if (this.rate < GEO_RATE && now - this.lastLimited > 15_000) {
      this.rate = Math.min(GEO_RATE, this.rate * 1.25);
      this.lastLimited = now;
      event({geoservice: "ok", rate: this.rate});
    }
    this.pump();
  }
};
const geoLog = createWriteStream(join(OUT, "geoservice.jsonl"), {flags: "a"});

// per-cube answer times: whole run and the last progress window
const cubeTimes = new Map<string, number[]>();
let windowTimes = new Map<string, number[]>();
const kindCounts: Record<string, number> = {};
const kindMs: Record<string, number> = {};
let upstreamSeq = 0;

function logUpstream(row: {url: string; kind: UpstreamKind | "schema"; cube: string | null; level: string; members: number; status: number; ms: number; bytes: number; error?: string; batchId?: string; worker?: number}) {
  upstreamSeq++;
  kindCounts[row.kind] = (kindCounts[row.kind] ?? 0) + 1;
  kindMs[row.kind] = (kindMs[row.kind] ?? 0) + row.ms;
  const cube = row.cube ?? "(none)";
  if (!cubeTimes.has(cube)) cubeTimes.set(cube, []);
  cubeTimes.get(cube)!.push(row.ms);
  if (!windowTimes.has(cube)) windowTimes.set(cube, []);
  windowTimes.get(cube)!.push(row.ms);
  upstreamLog.write(JSON.stringify({n: upstreamSeq, at: Math.round(elapsed() * 1000), ...row, ms: Math.round(row.ms)}) + "\n");
}

async function fetchText(url: string, timeoutMs: number): Promise<{status: number; body: string; ms: number; error?: string}> {
  const t = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {signal: controller.signal, headers: {accept: "application/json"}});
    const body = await res.text();
    return {status: res.status, body, ms: performance.now() - t};
  }
  catch (error) {
    return {status: 0, body: "", ms: performance.now() - t, error: controller.signal.aborted ? "timeout" : (error as Error).message};
  }
  finally {
    clearTimeout(timer);
  }
}

const cubeOfUrl = (url: string) => {
  const m = url.match(/[?&]cube=([^&]*)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
  }
  catch {
    return m[1];
  }
};

// ---------------------------------------------------------------------------------------------
// Shared responses, shapes, skips
// ---------------------------------------------------------------------------------------------

/** Responses of shared URLs held for the run, in MB (`--shared-mb`); least recently used are dropped. */
const SHARED_BUDGET = Number(opt("shared-mb", "512")) * 1024 * 1024;
const shared = new Map<string, WarmResponse>();
let sharedBytes = 0;
const sharedInflight = new Map<string, Promise<WarmResponse | null>>();
const sharedFailedAt = new Map<string, number>();
const sharedStats = {fetched: 0, served: 0, failed: 0, evicted: 0, bytes: 0};
const TIMEOUT_MS = Number(opt("timeout", "60000"));

async function getShared(url: string, kind: "shared" | "parent", level: string): Promise<WarmResponse | null> {
  const hit = shared.get(url);
  if (hit) {
    shared.delete(url);
    shared.set(url, hit); // most recently used last
    sharedStats.served++;
    return hit;
  }
  const failedAt = sharedFailedAt.get(url);
  if (failedAt && Date.now() - failedAt < 60_000) return null;
  let p = sharedInflight.get(url);
  if (!p) {
    p = (async () => {
      const geo = url.startsWith(GEOSERVICE);
      if (geo) await geoLimiter.acquire();
      else await limiter.acquire(url);
      const res = await fetchText(url, TIMEOUT_MS * 2);
      if (geo) {
        geoLimiter.release(res.status);
        geoLog.write(JSON.stringify({at: Math.round(elapsed() * 1000), url, kind, level, status: res.status, ms: Math.round(res.ms), bytes: res.body.length}) + "\n");
      }
      else {
        limiter.release({ms: res.ms, status: res.status, error: res.error, cube: cubeOfUrl(url), url});
        logUpstream({url, kind, cube: cubeOfUrl(url), level, members: 0, status: res.status, ms: res.ms, bytes: res.body.length, error: res.error});
      }
      if (res.error || res.status < 200 || res.status >= 300) {
        sharedFailedAt.set(url, Date.now());
        sharedStats.failed++;
        return null;
      }
      sharedStats.fetched++;
      sharedStats.bytes += res.body.length;
      const response = {status: res.status, body: res.body};
      shared.set(url, response);
      sharedBytes += res.body.length;
      for (const [k, v] of shared) {
        if (sharedBytes <= SHARED_BUDGET) break;
        shared.delete(k);
        sharedBytes -= v.body.length;
        sharedStats.evicted++;
      }
      return response;
    })();
    sharedInflight.set(url, p);
    p.finally(() => sharedInflight.delete(url)).catch(() => {});
  }
  else sharedStats.served++;
  return p;
}

interface ShapeState {
  record?: ShapeRecord;
  verifying?: boolean;
  waiters: ((r: ShapeRecord | null) => void)[];
  attempts: number;
  use: {members: number; batches: number; maxBatch: number; levels: Set<string>};
}
const shapeStates = new Map<string, ShapeState>();
const shapesLog = createWriteStream(join(OUT, "shapes.jsonl"), {flags: "a"});

async function shapeEpoch(cube: string): Promise<string> {
  return (await redis.hget("cube-epoch", `cube:${cube}`)) ?? "0";
}

async function onShape(msg: Extract<ToCoordinator, {t: "shape"}>): Promise<Extract<ToWorker, {t: "shapeRes"}>> {
  let s = shapeStates.get(msg.key);
  if (!s) shapeStates.set(msg.key, s = {waiters: [], attempts: 0, use: {members: 0, batches: 0, maxBatch: 0, levels: new Set()}});
  if (s.record && !(s.record.transient && s.attempts < 3)) return {t: "shapeRes", id: msg.id, record: s.record, verify: false};
  if (s.verifying) return new Promise(resolve => s!.waiters.push(record => resolve({t: "shapeRes", id: msg.id, record, verify: false})));
  if (!s.record) {
    const stored = await redis.get(`warm:shape:${msg.key}:${await shapeEpoch(msg.cube)}`);
    if (stored) {
      s.record = JSON.parse(stored) as ShapeRecord;
      shapesLog.write(JSON.stringify({key: msg.key, from: "redis", ...s.record}) + "\n");
      return {t: "shapeRes", id: msg.id, record: s.record, verify: false};
    }
  }
  s.verifying = true;
  s.attempts++;
  return {t: "shapeRes", id: msg.id, record: null, verify: true};
}

async function onShapeDone(msg: Extract<ToCoordinator, {t: "shapeDone"}>) {
  let s = shapeStates.get(msg.key);
  if (!s) shapeStates.set(msg.key, s = {waiters: [], attempts: 1, use: {members: 0, batches: 0, maxBatch: 0, levels: new Set()}});
  s.record = msg.record;
  s.verifying = false;
  shapesLog.write(JSON.stringify({key: msg.key, ...msg.record}) + "\n");
  if (!msg.record.transient) await redis.set(`warm:shape:${msg.key}:${await shapeEpoch(msg.record.cube)}`, JSON.stringify(msg.record), "PX", SHAPE_TTL_MS);
  s.waiters.splice(0).forEach(w => w(msg.record));
}

const skips = new Map<string, {template: WarmResponse | null; reason?: string; learning: boolean; waiters: ((t: WarmResponse | null) => void)[]}>();
const skipsLog = createWriteStream(join(OUT, "skips.jsonl"), {flags: "a"});

// ---------------------------------------------------------------------------------------------
// Workers and groups
// ---------------------------------------------------------------------------------------------

interface WorkerState {
  index: number;
  child: ReturnType<typeof fork>;
  busy: GroupJob | null;
  ready: boolean;
  usage?: {rss: number; heapUsed: number; cpuUser: number; cpuSystem: number; at: number};
  lastUsage?: {cpu: number; at: number};
  cpuPct: number;
  peakRss: number;
  groups: number;
  /** For the status view: the phase the current group is in, and its renders so far. */
  phase?: {name: string; items: number; since: number};
  rendered?: {done: number; of: number};
}

const totals = {reports: 0, fullHits: 0, rendered: 0, incomplete: 0, errors: 0, generators: 0, stored: 0, oldRequests: 0};
const phaseTotals: Record<string, number> = {};
const servedTotals: Record<string, number> = {};
const levelTimes = new Map<string, {first: number; last: number; reports: number; rendered: number}>();
const groupErrors: string[] = [];

function loadPlan(): GroupJob[] {
  const raw = JSON.parse(readFileSync(resolve(PLAN), "utf8")) as {profile: string; id: string; hierarchy?: string}[];
  const list = LIMIT ? raw.slice(0, LIMIT) : raw;
  let db: DatabaseSync | null = null;
  const levelOf = (profile: string, id: string): string => {
    db ??= new DatabaseSync(resolve(process.env.DIMENSIONS_DB_PATH ?? "data/dimensions.sqlite"), {readOnly: true});
    const dim = (db.prepare("SELECT dimension FROM profiles WHERE slug = ?").get(profile) as {dimension: string} | undefined)?.dimension;
    const row = db.prepare("SELECT hierarchy FROM members WHERE dimension = ? AND id = ? AND hidden = 0").get(dim ?? "", id) as {hierarchy: string} | undefined;
    return row?.hierarchy ?? "?";
  };
  const ORDER = ["geo|Nation", "geo|State", "geo|County", "geo|MSA", "geo|PUMA", "geo|Congressional District", "geo|Place"];
  const byLevel = new Map<string, string[]>();
  for (const r of list) {
    const key = `${r.profile}|${r.hierarchy ?? levelOf(r.profile, r.id)}`;
    if (!byLevel.has(key)) byLevel.set(key, []);
    byLevel.get(key)!.push(r.id);
  }
  const keys = Array.from(byLevel.keys()).sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const jobs: GroupJob[] = [];
  let gid = 0;
  for (const key of keys) {
    const [profile, hierarchy] = key.split("|");
    const ids = Array.from(new Set(byLevel.get(key)!)).sort();
    for (let i = 0; i < ids.length; i += GROUP) jobs.push({gid: gid++, profile, hierarchy, ids: ids.slice(i, i + GROUP)});
  }
  return jobs;
}

async function main() {
  // one warm at a time per Redis
  const lockId = `${process.pid}:${randomUUID()}`;
  const locked = await redis.set("warm:batch:lock", lockId, "PX", 60_000, "NX");
  if (!locked) {
    console.error(`[warm] another warm run holds warm:batch:lock (${await redis.get("warm:batch:lock")}); stopping`);
    process.exit(3);
  }
  const lockTimer = setInterval(() => { void redis.pexpire("warm:batch:lock", 60_000); }, 20_000);

  const jobs = loadPlan();
  const reportsTotal = jobs.reduce((n, j) => n + j.ids.length, 0);
  event({start: true, plan: PLAN, reports: reportsTotal, groups: jobs.length, workers: WORKERS, group: GROUP, cap: CAP_START, maxCap: CAP_MAX, tesseract: TESSERACT});

  // the cube schema, once per run
  const schemaStarted = performance.now();
  await limiter.acquire();
  const schemaRes = await fetchText(`${TESSERACT}tesseract/cubes`, 120_000);
  limiter.release({ms: schemaRes.ms, status: schemaRes.status, error: schemaRes.error, cube: null, url: "schema"});
  logUpstream({url: `${TESSERACT}tesseract/cubes`, kind: "schema", cube: null, level: "", members: 0, status: schemaRes.status, ms: schemaRes.ms, bytes: schemaRes.body.length, error: schemaRes.error});
  if (schemaRes.status !== 200) throw new Error(`cube schema: HTTP ${schemaRes.status} ${schemaRes.error ?? ""}`);
  const schema = JSON.parse(schemaRes.body) as {cubes: {name: string; dimensions: {hierarchies: {levels: {name: string}[]}[]}[]}[]};
  const cubeLevels: [string, string[]][] = schema.cubes.map(c => [c.name, c.dimensions.flatMap(d => d.hierarchies.flatMap(h => h.levels.map(l => l.name)))]);
  const schemaS = (performance.now() - schemaStarted) / 1000;
  event({schema: {cubes: cubeLevels.length, seconds: schemaS}});

  const logFd = openSync(join(OUT, "workers.log"), "a");
  const workerEntry = resolve(__dirname, "warm-batch-worker.ts");
  const workers: WorkerState[] = [];
  // Stopped from outside (Ctrl-C, or Stop in `npm run warm:ui`): stop the workers and free the lock,
  // so the next run can start at once. What was rendered stays in Redis, and a rerun skips it.
  let stopping = false;
  const stop = (signal: string) => {
    if (stopping) return;
    stopping = true;
    event({stopped: signal, reports: totals});
    for (const w of workers) w.child.kill("SIGTERM");
    clearInterval(lockTimer);
    void redis.get("warm:batch:lock")
      .then(holder => holder === lockId ? redis.del("warm:batch:lock") : 0)
      .catch(() => 0)
      .finally(() => events.end(() => process.exit(130)));
  };
  process.once("SIGTERM", () => stop("SIGTERM"));
  process.once("SIGINT", () => stop("SIGINT"));
  let next = 0;
  let done = 0;
  const finished = new Promise<void>(resolveAll => {
    const dispatch = (w: WorkerState) => {
      if (next >= jobs.length) {
        w.busy = null;
        if (workers.every(x => !x.busy)) resolveAll();
        return;
      }
      const job = jobs[next++];
      w.busy = job;
      // the previous group's render count must not be counted again under the new group's level
      w.rendered = undefined;
      w.phase = undefined;
      const lt = levelTimes.get(`${job.profile}|${job.hierarchy}`) ?? {first: elapsed(), last: 0, reports: 0, rendered: 0};
      levelTimes.set(`${job.profile}|${job.hierarchy}`, lt);
      w.child.send({t: "group", job} satisfies ToWorker);
    };
    for (let i = 0; i < WORKERS; i++) {
      const child = fork(workerEntry, [], {
        execArgv: [...process.execArgv, "--max-old-space-size=6144"],
        serialization: "advanced",
        stdio: ["ignore", logFd, logFd, "ipc"],
        env: process.env
      });
      const w: WorkerState = {index: i, child, busy: null, ready: false, cpuPct: 0, peakRss: 0, groups: 0};
      workers.push(w);
      const reply = (msg: ToWorker) => { if (child.connected) child.send(msg); };
      child.on("message", (msg: ToCoordinator) => {
        switch (msg.t) {
          case "ready":
            w.ready = true;
            dispatch(w);
            break;
          case "acq":
            if (msg.kind === "geo") void geoLimiter.acquire().then(() => reply({t: "grant", id: msg.id}));
            else void limiter.acquire(msg.url, msg.kind).then(() => reply({t: "grant", id: msg.id}));
            break;
          case "rel":
            if (msg.kind === "geo") {
              geoLimiter.release(msg.status);
              geoLog.write(JSON.stringify({at: Math.round(elapsed() * 1000), url: msg.url, kind: "geo", level: msg.level, status: msg.status, ms: Math.round(msg.ms), bytes: msg.bytes, worker: i}) + "\n");
              break;
            }
            limiter.release({ms: msg.ms, status: msg.status, error: msg.status >= 400 ? undefined : msg.error, cube: msg.cube, url: msg.url});
            logUpstream({...msg, worker: i});
            break;
          case "shared":
            void getShared(msg.url, msg.kind, msg.level).then(response => reply({t: "sharedRes", id: msg.id, response}));
            break;
          case "shape":
            void onShape(msg).then(reply);
            break;
          case "shapeDone":
            void onShapeDone(msg);
            break;
          case "shapeUse": {
            const s = shapeStates.get(msg.key);
            if (s) {
              s.use.members += msg.members;
              s.use.batches += msg.batches;
              s.use.maxBatch = Math.max(s.use.maxBatch, msg.batchSize);
              s.use.levels.add(msg.level);
            }
            break;
          }
          case "skip": {
            const s = skips.get(msg.key);
            if (!s) {
              skips.set(msg.key, {template: null, learning: true, waiters: []});
              reply({t: "skipRes", id: msg.id, template: null, learn: true});
            }
            else if (s.learning) s.waiters.push(t => reply({t: "skipRes", id: msg.id, template: t, learn: false}));
            else reply({t: "skipRes", id: msg.id, template: s.template, learn: false});
            break;
          }
          case "skipDone": {
            const s = skips.get(msg.key) ?? {template: null, learning: true, waiters: []};
            s.template = msg.template;
            s.reason = msg.reason;
            s.learning = false;
            skips.set(msg.key, s);
            skipsLog.write(JSON.stringify({key: msg.key, skippable: Boolean(msg.template), reason: msg.reason, status: msg.template?.status ?? null}) + "\n");
            s.waiters.splice(0).forEach(fn => fn(msg.template));
            break;
          }
          case "usage": {
            const cpu = (msg.cpuUser + msg.cpuSystem) / 1000;
            const now = Date.now();
            if (w.lastUsage) w.cpuPct = Math.round((100 * (cpu - w.lastUsage.cpu)) / Math.max(1, now - w.lastUsage.at));
            w.lastUsage = {cpu, at: now};
            w.usage = {...msg, at: now};
            w.peakRss = Math.max(w.peakRss, msg.rss);
            break;
          }
          case "phase":
            w.phase = {name: msg.phase, items: msg.items, since: Date.now()};
            if (msg.phase === "render") w.rendered = {done: 0, of: msg.items};
            break;
          case "rendered":
            w.rendered = {done: msg.rendered, of: msg.of};
            break;
          case "error":
            groupErrors.push(`group ${msg.gid}: ${msg.message.slice(0, 500)}`);
            event({workerError: i, gid: msg.gid, message: msg.message.slice(0, 300)});
            break;
          case "groupDone": {
            const st: GroupStats = msg.stats;
            done++;
            w.groups++;
            totals.reports += st.reports;
            totals.fullHits += st.fullHits;
            totals.rendered += st.rendered;
            totals.incomplete += st.incomplete;
            totals.errors += st.errors;
            totals.generators += st.generators;
            totals.stored += st.stored;
            totals.oldRequests += st.oldRequests;
            for (const [k, v] of Object.entries(st.phases)) phaseTotals[k] = (phaseTotals[k] ?? 0) + v;
            for (const [k, v] of Object.entries(st.served)) servedTotals[k] = (servedTotals[k] ?? 0) + v;
            const lt = levelTimes.get(`${st.profile}|${st.hierarchy}`)!;
            lt.last = elapsed();
            lt.reports += st.reports;
            lt.rendered += st.rendered;
            // remaining time at the pace so far (reports finished per second; levels differ a lot,
            // so it settles only once a few groups of the large levels are done)
            const finished = totals.rendered + totals.fullHits + totals.errors;
            const etaMin = finished ? Math.round((elapsed() / finished) * (reportsTotal - finished) / 60) : null;
            event({group: st.gid, level: `${st.profile}/${st.hierarchy}`, etaMin, reports: st.reports, fullHits: st.fullHits, rendered: st.rendered, incomplete: st.incomplete, errors: st.errors, phases: Object.fromEntries(Object.entries(st.phases).map(([k, v]) => [k, Math.round(v * 10) / 10])), worker: i, done: `${done}/${jobs.length}`});
            dispatch(w);
            break;
          }
        }
      });
      child.on("exit", code => {
        if (w.busy) {
          groupErrors.push(`worker ${i} exited (${code}) during group ${w.busy.gid}`);
          event({workerExit: i, code, gid: w.busy.gid});
          w.busy = null;
          if (workers.every(x => !x.busy)) resolveAll();
        }
      });
      const config: WorkerConfig = {
        outDir: OUT, workerIndex: i, renderConcurrency: Number(opt("render", "6")), fetchConcurrency: Number(opt("fetch", "32")),
        maxUrlLength: Number(opt("max-url", "6000")), maxIds: Number(opt("max-ids", "400")), fetchTimeoutMs: TIMEOUT_MS,
        force: flag("force"), noBatch: flag("no-batch"), geoConcurrency: Math.max(4, Math.ceil(GEO_CONCURRENCY / WORKERS) * 2), sharedBudgetMb: Number(opt("worker-shared-mb", "128")), cubeLevels
      };
      child.send({t: "init", config} satisfies ToWorker);
    }
  });

  // progress
  let lastSent = 0;
  let lastAt = Date.now();
  const percentile = (xs: number[], q: number) => {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    return Math.round(s[Math.min(s.length - 1, Math.floor(q * s.length))]);
  };
  const progress = async () => {
    const info = await redis.info("memory").catch(() => "");
    const used = Number(info.match(/used_memory:(\d+)/)?.[1] ?? 0);
    const keys = await redis.dbsize().catch(() => 0);
    const now = Date.now();
    const rate = (limiter.totals.sent - lastSent) / ((now - lastAt) / 1000);
    lastSent = limiter.totals.sent;
    lastAt = now;
    const perCube = Array.from(windowTimes).sort((a, b) => b[1].length - a[1].length).slice(0, 10)
      .map(([cube, xs]) => ({cube, n: xs.length, p50: percentile(xs, 0.5), p95: percentile(xs, 0.95)}));
    windowTimes = new Map();
    const shapesCount = {verified: 0, rejected: 0};
    shapeStates.forEach(s => { if (s.record) shapesCount[s.record.status]++; });
    const line = {
      t: new Date().toISOString(), elapsedS: Math.round(elapsed()),
      groups: `${done}/${jobs.length}`, reports: {...totals, total: reportsTotal},
      upstream: {...kindCounts}, served: {...servedTotals}, shapes: shapesCount, skips: Array.from(skips.values()).filter(s => s.template).length,
      cap: limiter.cap, inFlight: limiter.inFlight, heavyInFlight: limiter.heavyInFlight, queue: limiter.waiting.length, ratePerS: Math.round(rate * 10) / 10,
      errors: {s5xx: limiter.totals.s5xx, timeouts: limiter.totals.timeouts, s4xx: limiter.totals.s4xx},
      perCube, redis: {usedMemory: used, keys}, shared: {...sharedStats, held: shared.size, heldBytes: sharedBytes},
      geoservice: {rate: geoLimiter.rate, ...geoLimiter.totals, waiting: geoLimiter.waiting.length},
      workers: workers.map(w => ({i: w.index, rss: w.usage?.rss ?? 0, cpuPct: w.cpuPct, group: w.busy?.gid ?? null})),
      coordinator: {rss: process.memoryUsage().rss}
    };
    progressLog.write(JSON.stringify(line) + "\n");
    console.log(`[warm] ${line.elapsedS}s groups ${line.groups} reports ${totals.rendered + totals.fullHits}/${reportsTotal} cap ${limiter.cap} ${line.ratePerS} req/s queue ${line.queue} 5xx ${limiter.totals.s5xx} timeouts ${limiter.totals.timeouts} redis ${(used / 1e9).toFixed(2)} GB ${keys} keys`);
  };
  // status.txt: a human-readable snapshot, rewritten every 5 s (`watch -n 5 cat <out>/status.txt`)
  const levelTotals = new Map<string, number>();
  for (const j of jobs) levelTotals.set(`${j.profile}|${j.hierarchy}`, (levelTotals.get(`${j.profile}|${j.hierarchy}`) ?? 0) + j.ids.length);
  let statusLast = {sent: 0, geo: 0, at: Date.now()};
  let lastRedis = {used: 0, keys: 0};
  const fmtS = (s: number) => s >= 3600 ? `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m` : s >= 60 ? `${Math.floor(s / 60)}m${String(Math.round(s % 60)).padStart(2, "0")}s` : `${Math.round(s)}s`;
  const writeStatus = () => {
    const now = Date.now();
    const dt = Math.max(0.001, (now - statusLast.at) / 1000);
    const tessRate = (limiter.totals.sent - statusLast.sent) / dt;
    const geoRate = (geoLimiter.totals.sent - statusLast.geo) / dt;
    statusLast = {sent: limiter.totals.sent, geo: geoLimiter.totals.sent, at: now};
    // reports finished, counting renders of groups still in progress
    const partial = workers.reduce((n, w) => n + (w.busy && w.rendered ? w.rendered.done : 0), 0);
    const finished = totals.rendered + totals.fullHits + totals.errors;
    const doneNow = finished + partial;
    const eta = doneNow ? (elapsed() / doneNow) * (reportsTotal - doneNow) : null;
    const lines: string[] = [];
    lines.push(`Batched warm  ${new Date().toISOString().slice(11, 19)} UTC   elapsed ${fmtS(elapsed())}   plan ${PLAN.split("/").pop()}`);
    lines.push(`Reports   ${doneNow} / ${reportsTotal} (${((100 * doneNow) / Math.max(1, reportsTotal)).toFixed(1)}%)   groups ${done}/${jobs.length}   incomplete ${totals.incomplete}   errors ${totals.errors}   ETA ${eta === null ? "—" : fmtS(eta)} (pace so far; levels differ)`);
    lines.push("");
    lines.push("Levels");
    for (const [key, total] of levelTotals) {
      const lt = levelTimes.get(key);
      const inProgress = workers.filter(w => w.busy && `${w.busy.profile}|${w.busy.hierarchy}` === key).reduce((n, w) => n + (w.rendered?.done ?? 0), 0);
      const d = (lt?.reports ?? 0) + inProgress;
      const state = !lt ? "waiting" : d >= total ? `done in ${fmtS(lt.last - lt.first)}` : `running ${fmtS(elapsed() - lt.first)}`;
      lines.push(`  ${key.replace("|", "/").padEnd(34)} ${String(d).padStart(6)} / ${String(total).padEnd(6)} ${state}`);
    }
    lines.push("");
    lines.push("Workers");
    for (const w of workers) {
      if (!w.busy) { lines.push(`  w${w.index}  idle   cpu ${w.cpuPct}%`); continue; }
      const ph = w.phase ? `${w.phase.name} (${w.phase.items}) for ${fmtS((now - w.phase.since) / 1000)}` : "starting";
      const r = w.phase?.name === "render" && w.rendered ? `  rendered ${w.rendered.done}/${w.rendered.of}` : "";
      lines.push(`  w${w.index}  group ${w.busy.gid} ${w.busy.profile}/${w.busy.hierarchy} (${w.busy.ids.length})  ${ph}${r}   cpu ${w.cpuPct}%  rss ${Math.round((w.usage?.rss ?? 0) / 1e6)} MB`);
    }
    lines.push("");
    lines.push(`Tesseract   ${tessRate.toFixed(1)} req/s   in flight ${limiter.inFlight}/${limiter.cap} (max ${CAP_MAX})   queue ${limiter.waiting.length}   sent ${limiter.totals.sent}   5xx ${limiter.totals.s5xx}   4xx ${limiter.totals.s4xx}   timeouts ${limiter.totals.timeouts}`);
    lines.push(`            by kind: ${Object.entries(kindCounts).map(([k, v]) => `${k} ${v}`).join(", ")}`);
    lines.push(`Geoservice  ${geoRate.toFixed(1)} req/s   in flight ${geoLimiter.inFlight}/${GEO_CONCURRENCY}   rate limit ${geoLimiter.rate.toFixed(1)}/s   sent ${geoLimiter.totals.sent}   429s ${geoLimiter.totals.limited}   waiting ${geoLimiter.waiting.length}`);
    const sc = {verified: 0, rejected: 0};
    shapeStates.forEach(s => { if (s.record) sc[s.record.status]++; });
    lines.push(`Shapes      verified ${sc.verified}   rejected ${sc.rejected}   skips learnt ${Array.from(skips.values()).filter(s => s.template).length}`);
    lines.push(`Shared      held ${shared.size} (${Math.round(sharedBytes / 1e6)} MB)   fetched ${sharedStats.fetched}   served ${sharedStats.served}   failed ${sharedStats.failed}`);
    lines.push(`Redis       ${(lastRedis.used / 1e9).toFixed(2)} GB   ${lastRedis.keys} keys`);
    if (groupErrors.length) lines.push(`Last error  ${groupErrors[groupErrors.length - 1].slice(0, 200)}`);
    writeFileSync(join(OUT, "status.txt"), lines.join("\n") + "\n");
  };
  const statusTimer = setInterval(() => {
    void Promise.all([redis.info("memory").catch(() => ""), redis.dbsize().catch(() => 0)]).then(([info, keys]) => {
      lastRedis = {used: Number(info.match(/used_memory:(\d+)/)?.[1] ?? 0), keys};
    });
    try { writeStatus(); } catch { /* the status view never stops the run */ }
  }, 5000);
  const tickTimer = setInterval(() => limiter.tick(), 1000);
  const progressTimer = setInterval(() => { void progress(); }, PROGRESS_MS);

  await finished;
  await progress();
  try { writeStatus(); } catch { /* ignore */ }
  clearInterval(statusTimer);
  clearInterval(tickTimer);
  clearInterval(progressTimer);
  await Promise.all(workers.map(w => new Promise<void>(res => {
    if (!w.child.connected) return res();
    w.child.once("exit", () => res());
    w.child.send({t: "stop"} satisfies ToWorker);
  })));

  const info = await redis.info("memory");
  const summary = {
    plan: PLAN, tesseract: TESSERACT, workers: WORKERS, group: GROUP, capStart: CAP_START, capMax: CAP_MAX, capFinal: limiter.cap, capHistory: limiter.history,
    wallS: elapsed(), schemaS, reports: {...totals, total: reportsTotal},
    phasesWorkerSeconds: phaseTotals, served: servedTotals,
    upstream: {byKind: kindCounts, msByKind: kindMs, sent: limiter.totals.sent, s5xx: limiter.totals.s5xx, s4xx: limiter.totals.s4xx, timeouts: limiter.totals.timeouts},
    perCube: Array.from(cubeTimes).map(([cube, xs]) => ({cube, n: xs.length, p50: percentile(xs, 0.5), p95: percentile(xs, 0.95), totalS: Math.round(xs.reduce((a, b) => a + b, 0) / 1000)})).sort((a, b) => b.totalS - a.totalS),
    shared: sharedStats,
    geoservice: {rateFinal: geoLimiter.rate, ...geoLimiter.totals},
    shapes: Array.from(shapeStates).map(([key, s]) => ({key, ...s.record, use: {...s.use, levels: Array.from(s.use.levels)}})),
    skips: Array.from(skips).map(([key, s]) => ({key, skippable: Boolean(s.template), reason: s.reason})),
    levels: Object.fromEntries(Array.from(levelTimes).map(([k, v]) => [k, {...v, wallS: Math.round(v.last - v.first)}])),
    workerUsage: workers.map(w => ({i: w.index, peakRss: w.peakRss, groups: w.groups})),
    redis: {usedMemory: Number(info.match(/used_memory:(\d+)/)?.[1] ?? 0), keys: await redis.dbsize()},
    groupErrors
  };
  writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary, null, 1));
  event({finished: true, wallS: Math.round(elapsed()), reports: totals});
  clearInterval(lockTimer);
  if ((await redis.get("warm:batch:lock")) === lockId) await redis.del("warm:batch:lock");
  await new Promise(r => upstreamLog.end(r));
  await new Promise(r => progressLog.end(r));
  await new Promise(r => shapesLog.end(r));
  await new Promise(r => skipsLog.end(r));
  await new Promise(r => geoLog.end(r));
  await new Promise(r => events.end(r));
  redis.disconnect();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
