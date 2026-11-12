// A small web page to start, watch and stop the batched warmer (`npm run warm:batch`) and browse past
// runs. It builds the plan for the strategy you pick, starts the warmer as a child process, and reads
// the files the warmer writes (progress.jsonl, events.jsonl, status.txt, summary.json). See
// docs/deployment.md, "Warm UI".
//
//   NEXT_PUBLIC_TESSERACT_URL=https://api-penn.datausa.io/ REDIS_URL=redis://127.0.0.1:6379 \
//     npm run warm:ui -- [--port 5560] [--runs warm-runs]
//
// Strategies. Every run computes only outputs missing from Redis (the warmer checks each report's keys),
// so they differ in which reports they look at and what they clear first:
// - whole site: every report of every published level;
// - profiles: the levels you pick, all members, the largest N or a random share;
// - generators: the profiles that have them; only their outputs count as missing. A changed
//   generator has new keys, so its outputs are missing by themselves; "recompute" deletes their
//   current outputs first, for a refresh without a code change;
// - cubes: purges the cubes (as a data release does) and recomputes the outputs that read them, for the
//   reports that had them cached.
//
// It listens on 127.0.0.1 only and has no login: on a server, reach it through an SSH tunnel
// (`ssh -L 5560:127.0.0.1:5560 <host>`, then http://localhost:5560). Requests that change anything
// need an `X-Warm-UI` header, which a page on another site cannot send without CORS approval.
// One run at a time, as the warmer's own Redis lock (`warm:batch:lock`) also enforces.
//
// Two more tools, for load tests of the cache (docs/deployment.md, "Warm UI"):
// - Stress: a strategy that sends cached report pages to a site at fixed rates (scripts/cache/stress.ts).
//   It needs neither Redis nor Tesseract variables: on a load machine, `npm run warm:ui` alone.
// - Monitor: a read-only Redis sampler (scripts/cache/monitor.ts), next to a warm or a stress run.
//   `--monitor-only` serves only it (no warm, no stress, and no Redis connection in this process),
//   for the site's host; `--monitor` starts sampling at launch.
import {spawn, type ChildProcess} from "node:child_process";
import {closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, statSync, writeFileSync} from "node:fs";
import http from "node:http";
import {join, resolve} from "node:path";
import {DatabaseSync} from "node:sqlite";
import Redis from "ioredis";
import {latest as monitorLatest, parseSamples, series as monitorSeries} from "./monitor-view";
import {FORBIDDEN_HOSTS, type StressConfig} from "./stress";
import {buildStages, buildUrls, DEFAULT_MIX, DEFAULT_STRESS, probePlaces, stressStatus, type StageInput, type UrlMix} from "./stress-plan";
import {MONITOR_CARD, PANELS_CSS, PANELS_JS, STRESS_CARD, STRESS_PANEL} from "./warm-ui-panels";
import {isPendingLevel} from "../../src/lib/geo/levels";
import {purgeTags} from "../../src/lib/cache/purge";
import {TAG_REGISTRY_KEY} from "../../src/lib/cache/store";
import {parsePurgeInput} from "../../src/lib/cache/tags";

const argv = process.argv.slice(2);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};
const PORT = Number(opt("port", "5560"));
const ROOT = resolve(__dirname, "../..");
const RUNS = resolve(opt("runs", join(ROOT, "warm-runs")));
const DB_PATH = resolve(process.env.DIMENSIONS_DB_PATH ?? join(ROOT, "data/dimensions.sqlite"));
const TESSERACT = process.env.NEXT_PUBLIC_TESSERACT_URL ?? "";
const REDIS_URL = process.env.REDIS_URL ?? "";
const TSX = join(ROOT, "node_modules/.bin/tsx");
const MONITOR_ONLY = argv.includes("--monitor-only");
const MONITOR_AT_START = argv.includes("--monitor");
const MONITOR_INTERVAL = Number(opt("monitor-interval", "1000"));
const MONITOR_KEYS = Number(opt("monitor-keys", "100"));
/** Warm strategies need both; Stress needs neither; the Monitor needs Redis. */
const WARM = !MONITOR_ONLY && Boolean(TESSERACT && REDIS_URL);
const STRESS = !MONITOR_ONLY;

if (MONITOR_ONLY && !REDIS_URL) {
  console.error("usage: REDIS_URL=... npm run warm:ui -- --monitor-only [--monitor] [--port 5560] [--runs warm-runs]");
  process.exit(2);
}
if (!MONITOR_ONLY && !WARM) {
  console.log("NEXT_PUBLIC_TESSERACT_URL or REDIS_URL is not set: only the Stress mode is available" + (REDIS_URL ? " (and the Redis monitor)" : ""));
}
mkdirSync(RUNS, {recursive: true});
// The warm's connection. Not opened with --monitor-only: the monitor child has its own, read-only one.
const redis = WARM ? new Redis(REDIS_URL, {maxRetriesPerRequest: 2, lazyConnect: false}) : (null as unknown as Redis);
/** The Redis URL without its password, for display. */
const redisShown = REDIS_URL.replace(/\/\/([^:@/]*):[^@/]*@/, "//$1:***@");

// ---------------------------------------------------------------------------------------------
// Levels, generators, cubes
// ---------------------------------------------------------------------------------------------

interface Level {key: string; profile: string; hierarchy: string; members: number}

const GEO_ORDER = ["Nation", "State", "County", "MSA", "PUMA", "Congressional District", "Place"];

const openDb = () => new DatabaseSync(DB_PATH, {readOnly: true});

/** Every profile level with visible members, in the order the warmer processes them. */
function levels(): Level[] {
  const db = openDb();
  try {
    const rows = db.prepare(`
      SELECT p.slug AS profile, m.hierarchy AS hierarchy, COUNT(*) AS n
      FROM members m JOIN profiles p ON p.dimension = m.dimension AND p.ordering = 0
      WHERE m.hidden = 0 GROUP BY p.slug, m.hierarchy`).all() as {profile: string; hierarchy: string; n: number}[];
    return rows
      .filter(r => !isPendingLevel(r.hierarchy))
      .map(r => ({key: `${r.profile}|${r.hierarchy}`, profile: r.profile, hierarchy: r.hierarchy, members: Number(r.n)}))
      .sort((a, b) => {
        const ga = a.profile === "geo" ? GEO_ORDER.indexOf(a.hierarchy) : 99;
        const gb = b.profile === "geo" ? GEO_ORDER.indexOf(b.hierarchy) : 99;
        return ga - gb || a.profile.localeCompare(b.profile) || b.members - a.members;
      });
  }
  finally {
    db.close();
  }
}

interface GeneratorInfo {id: number; profile: string; name: string; cubes: string[]}

/**
 * The cubes a generator's request URL names (`cube=<name>` or `/cubes/<name>`), decoded; a part
 * filled from the attributes (`${attrs.x}`) becomes `*`. Generators that read in-process `/api/`
 * endpoints or the geoservice name none: only the cache's tag sets know what they read.
 */
function urlCubes(source: string): string[] {
  const api = source.match(/^\s*api:\s*(.*)$/m)?.[1] ?? "";
  const names = [...api.matchAll(/[?&]cube=([^&`"]+)/g), ...api.matchAll(/\/cubes\/([^/?`"]+)/g)].map(m => {
    const raw = m[1].replace(/\$\{[^}]*\}/g, "*").replace(/\+/g, " ").replace(/\.(json|jsonrecords|csv)$/, "");
    try {
      return decodeURIComponent(raw).trim();
    }
    catch {
      return raw.trim();
    }
  });
  return Array.from(new Set(names.filter(Boolean)));
}

/** Whether `cube` fits `pattern`, whose `*`s stand for any text (the same test runs in the page). */
function cubeMatches(pattern: string, cube: string): boolean {
  const parts = pattern.split("*");
  if (parts.length === 1) return pattern === cube;
  const first = parts[0], last = parts[parts.length - 1];
  if (cube.length < first.length + last.length || !cube.startsWith(first) || !cube.endsWith(last)) return false;
  let at = first.length;
  for (const part of parts.slice(1, -1)) {
    const found = cube.indexOf(part, at);
    if (found < 0) return false;
    at = found + part.length;
  }
  return at <= cube.length - last.length;
}

/** Report generators from their files: `src/content/reports/<profile>/generators/<id>-<name>.ts`. */
function generatorIndex(): GeneratorInfo[] {
  const dir = join(ROOT, "src/content/reports");
  const out: GeneratorInfo[] = [];
  for (const profile of readdirSync(dir)) {
    const gdir = join(dir, profile, "generators");
    if (!existsSync(gdir)) continue;
    for (const file of readdirSync(gdir)) {
      const m = file.match(/^(\d+)-(.+)\.ts$/);
      if (m) out.push({id: Number(m[1]), profile, name: m[2].replace(/-/g, " "), cubes: urlCubes(readFileSync(join(gdir, file), "utf8"))});
    }
  }
  return out.sort((a, b) => a.id - b.id);
}
const GENERATORS = generatorIndex();

/** The generators whose request URL names one of `cubes`. */
function generatorsReading(cubes: string[]): GeneratorInfo[] {
  return GENERATORS.filter(g => g.cubes.some(pattern => cubes.some(cube => cubeMatches(pattern, cube))));
}

/** How many cached entries (generator outputs, attributes, lookups) the tag sets list for these tags. */
async function cachedEntries(tags: string[]): Promise<number> {
  const counts = await Promise.all(tags.map(t => redis.scard(t).catch(() => 0)));
  return counts.reduce((a, b) => a + b, 0);
}

/** Cubes the cache has seen (they have a tag set), from the tag registry. */
async function knownCubes(): Promise<string[]> {
  const tags = await redis.smembers(TAG_REGISTRY_KEY).catch(() => [] as string[]);
  return tags.filter(t => t.startsWith("cube:")).map(t => t.slice(5)).sort();
}

interface Pick {key: string; mode: "all" | "top" | "sample"; n: number}
type PlanEntry = {profile: string; id: string; hierarchy: string};

/**
 * The members of each picked level: all of them, the `n` largest by zvalue (most visited first), or
 * `n` percent at random (with the 10 largest always in).
 */
function buildPlan(picks: Pick[]): PlanEntry[] {
  const db = openDb();
  const plan: PlanEntry[] = [];
  try {
    for (const p of picks) {
      const [profile, hierarchy] = p.key.split("|");
      const dim = (db.prepare("SELECT dimension FROM profiles WHERE slug = ? AND ordering = 0").get(profile) as {dimension: string} | undefined)?.dimension;
      if (!dim) continue;
      const ids = (db.prepare("SELECT DISTINCT id FROM members WHERE dimension = ? AND hierarchy = ? AND hidden = 0 ORDER BY zvalue DESC NULLS LAST, id")
        .all(dim, hierarchy) as {id: string}[]).map(r => String(r.id));
      let chosen = ids;
      if (p.mode === "top") chosen = ids.slice(0, Math.max(1, Math.floor(p.n)));
      if (p.mode === "sample") {
        const want = Math.max(1, Math.round((ids.length * Math.min(100, Math.max(0, p.n))) / 100));
        const head = ids.slice(0, Math.min(10, want));
        const rest = ids.slice(head.length);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        chosen = [...head, ...rest.slice(0, want - head.length)];
      }
      for (const id of chosen) plan.push({profile, id, hierarchy});
    }
  }
  finally {
    db.close();
  }
  return plan;
}

/** The reports whose cached entries read these cube tags (from the tag sets: `<key>|<profile>|<member>`). */
async function reportsReading(tags: string[]): Promise<PlanEntry[]> {
  const owners = new Map<string, Set<string>>();
  for (const tag of tags) {
    let cursor = "0";
    do {
      const [next, members] = await redis.sscan(tag, cursor, "COUNT", 2000);
      cursor = next;
      for (const m of members) {
        const [, profile, member] = m.split("|");
        if (!profile || !member) continue;
        if (!owners.has(profile)) owners.set(profile, new Set());
        owners.get(profile)!.add(member);
      }
    } while (cursor !== "0");
  }
  const db = openDb();
  const plan: PlanEntry[] = [];
  try {
    for (const [profile, members] of owners) {
      const dim = (db.prepare("SELECT dimension FROM profiles WHERE slug = ? AND ordering = 0").get(profile) as {dimension: string} | undefined)?.dimension;
      if (!dim) continue;
      const list = Array.from(members);
      for (let i = 0; i < list.length; i += 500) {
        const chunk = list.slice(i, i + 500);
        const rows = db.prepare(`SELECT id, hierarchy FROM members WHERE dimension = ? AND hidden = 0 AND id IN (${chunk.map(() => "?").join(",")})`)
          .all(dim, ...chunk) as {id: string; hierarchy: string}[];
        const seen = new Set<string>();
        for (const r of rows) {
          if (seen.has(String(r.id)) || isPendingLevel(r.hierarchy)) continue;
          seen.add(String(r.id));
          plan.push({profile, id: String(r.id), hierarchy: r.hierarchy});
        }
      }
    }
  }
  finally {
    db.close();
  }
  return plan;
}

/** Deletes every cached output of these generators (all versions); returns how many. */
async function deleteGeneratorOutputs(ids: number[]): Promise<number> {
  let deleted = 0;
  for (const id of ids) {
    let cursor = "0";
    do {
      const [next, keys] = await redis.scan(cursor, "MATCH", `gen:${id}:*`, "COUNT", 5000);
      cursor = next;
      if (keys.length) deleted += await redis.unlink(...keys);
    } while (cursor !== "0");
  }
  return deleted;
}

// ---------------------------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------------------------

type Mode = "site" | "levels" | "generators" | "cubes" | "stress" | "monitor";

interface Settings {workers: number; group: number; cap: number; maxCap: number; capStep: number; latencyFloor: number; slowP95: number; heavy: number; geoRate: number; force: boolean}

const DEFAULTS: Settings = {workers: 2, group: 300, cap: 12, maxCap: 24, capStep: 4, latencyFloor: 12, slowP95: 15000, heavy: 5, geoRate: 50, force: false};

interface Meta {
  id: string;
  mode: Mode;
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
  stoppedByUser?: boolean;
  reports: number;
  levels: Record<string, number>;
  generators?: number[];
  cubes?: string[];
  /** What was cleared before the run (generator outputs deleted, cubes purged). */
  prepared?: string;
  settings?: Settings;
  tesseract: string;
  redis: string;
  pid?: number;
  /** stress runs: the target and the stages */
  stress?: {target: string; stages: number; seconds: number; rates: number[]};
  /** monitor runs: how often, and the MGET sample size */
  monitor?: {intervalMs: number; keys: number};
}

interface StartBody {
  mode?: Mode;
  picks?: Pick[];
  generators?: number[];
  cubes?: string[];
  /** generators: delete their current outputs first. */
  recompute?: boolean;
  /** cubes: purge them first. */
  purge?: boolean;
  settings?: Partial<Settings>;
  /** stress: everything the Stress panel sends */
  stress?: StressBody;
}

interface StressBody {
  target?: string;
  tesseract?: string;
  monitorUrl?: string;
  stageInput?: StageInput;
  mix?: UrlMix;
  cap?: number;
  timeoutMs?: number;
  hitMargin?: number;
  hitRule?: "total" | "best";
  stop?: Partial<StressConfig["stop"]>;
}

let current: {meta: Meta; child: ChildProcess} | null = null;
let preparing: string | null = null;

const runDir = (id: string) => join(RUNS, id);
const metaPath = (id: string) => join(runDir(id), "meta.json");
const saveMeta = (meta: Meta) => writeFileSync(metaPath(meta.id), JSON.stringify(meta, null, 1));

function readMeta(id: string): Meta | null {
  try {
    const meta = JSON.parse(readFileSync(metaPath(id), "utf8")) as Meta;
    meta.mode ??= "levels";
    return meta;
  }
  catch {
    return null;
  }
}

async function startRun(body: StartBody): Promise<{id?: string; error?: string}> {
  if (current || preparing) return {error: current ? `run ${current.meta.id} is still going` : "another run is being prepared"};
  if (body.mode === "stress") return startStress(body.stress ?? {});
  if (!WARM) return {error: MONITOR_ONLY ? "this UI was started with --monitor-only" : "warm runs need NEXT_PUBLIC_TESSERACT_URL and REDIS_URL"};
  const holder = await redis.get("warm:batch:lock").catch(() => null);
  if (holder) return {error: `another warm run holds warm:batch:lock (${holder}). If it was killed, the lock expires within a minute.`};
  const mode: Mode = body.mode ?? "levels";
  const s: Settings = {...DEFAULTS, ...body.settings};
  const extra: string[] = [];
  let plan: PlanEntry[] = [];
  let prepared: string | undefined;
  let generators: number[] | undefined;
  let cubes: string[] | undefined;
  preparing = mode;
  try {
    if (mode === "site") plan = buildPlan(levels().map(l => ({key: l.key, mode: "all", n: 0})));
    else if (mode === "levels") plan = buildPlan(body.picks ?? []);
    else if (mode === "generators") {
      const known = new Set(GENERATORS.map(g => g.id));
      generators = Array.from(new Set((body.generators ?? []).filter(id => known.has(id))));
      if (!generators.length) return {error: "no known generator ids"};
      // the levels of the profiles that have these generators, or the ones picked
      const profiles = new Set(GENERATORS.filter(g => generators!.includes(g.id)).map(g => g.profile));
      const picks = body.picks?.length ? body.picks : levels().filter(l => profiles.has(l.profile)).map(l => ({key: l.key, mode: "all" as const, n: 0}));
      plan = buildPlan(picks);
      extra.push("--generators", generators.join(","));
      if (body.recompute) prepared = `deleted ${(await deleteGeneratorOutputs(generators)).toLocaleString("en-US")} cached outputs of generators ${generators.join(", ")}`;
    }
    else if (mode === "cubes") {
      const {valid, invalid} = parsePurgeInput(body.cubes ?? [], []);
      if (invalid.length) return {error: `invalid cube names: ${invalid.join(", ")}`};
      if (!valid.length) return {error: "no cubes given"};
      cubes = valid.map(t => t.replace(/^cube:/, ""));
      const readers = generatorsReading(cubes);
      // Which reports: those whose cached outputs read these cubes (the tag sets, read before the
      // purge empties them; they also cover attributes, lookups and /api/ generators), plus every
      // report of the profiles whose generators name these cubes in their URL, known from the code,
      // so the plan doesn't depend on the tag sets (a purge run elsewhere has emptied them).
      const profiles = new Set(readers.map(g => g.profile));
      const fromCode = buildPlan(levels().filter(l => profiles.has(l.profile)).map(l => ({key: l.key, mode: "all" as const, n: 0})));
      const seen = new Set(fromCode.map(p => `${p.profile}|${p.id}`));
      plan = fromCode.concat((await reportsReading(valid)).filter(p => !seen.has(`${p.profile}|${p.id}`)));
      if (!plan.length) return {error: "no generator names these cubes and no cached output reads them: nothing to recompute"};
      const entries = await cachedEntries(valid);
      if (body.purge === false && entries > 0 && !s.force) {
        return {error: `${cubes.join(", ")} still ${entries === 1 ? "has 1 cached entry" : `have ${entries.toLocaleString("en-US")} cached entries`}: without a purge the warm finds them cached and recomputes nothing. Tick "Purge them first", or Force to overwrite them.`};
      }
      if (body.purge !== false) {
        const results = await purgeTags(redis, valid);
        prepared = "purged " + results.map(r => `${r.tag.replace(/^cube:/, "")} (${r.deleted.toLocaleString("en-US")} entries)`).join(", ");
      }
      generators = readers.map(g => g.id);
      // Force without a purge overwrites only the outputs of the generators that read these cubes,
      // not every generator of these reports
      if (s.force && readers.length) extra.push("--generators", generators.join(","));
      // outputs of these cubes that failed before the data changed are tried again (not the others)
      extra.push("--retry-cubes", cubes.join(","));
    }
  }
  finally {
    preparing = null;
  }
  if (!plan.length) return {error: "no reports picked"};
  const counts: Record<string, number> = {};
  for (const p of plan) counts[`${p.profile}|${p.hierarchy}`] = (counts[`${p.profile}|${p.hierarchy}`] ?? 0) + 1;
  const id = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  mkdirSync(runDir(id), {recursive: true});
  writeFileSync(join(runDir(id), "plan.json"), JSON.stringify(plan));
  const meta: Meta = {id, mode, startedAt: new Date().toISOString(), reports: plan.length, levels: counts, generators, cubes, prepared, settings: s, tesseract: TESSERACT, redis: redisShown};
  const args = [
    join(ROOT, "scripts/cache/warm-batch.ts"), "--plan", join(runDir(id), "plan.json"), "--out", runDir(id),
    "--workers", String(s.workers), "--group", String(s.group), "--cap", String(s.cap), "--max-cap", String(s.maxCap),
    "--cap-step", String(s.capStep), "--latency-floor", String(s.latencyFloor), "--slow-p95", String(s.slowP95),
    "--heavy", String(s.heavy), "--geo-rate", String(s.geoRate),
    ...(s.force ? ["--force"] : []),
    ...extra
  ];
  const log = openSync(join(runDir(id), "output.log"), "a");
  const child = spawn(TSX, args, {cwd: ROOT, env: process.env, stdio: ["ignore", log, log]});
  closeSync(log);
  meta.pid = child.pid;
  saveMeta(meta);
  current = {meta, child};
  child.on("exit", code => {
    meta.endedAt = new Date().toISOString();
    meta.exitCode = code;
    saveMeta(meta);
    if (current?.meta.id === id) current = null;
  });
  return {id};
}

const newId = (suffix: string) => new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + suffix;

/** A stress run: builds the URL list and the stages, writes them to the run folder, starts stress.ts. */
function startStress(b: StressBody): {id?: string; error?: string} {
  if (!STRESS) return {error: "this UI was started with --monitor-only"};
  const d = DEFAULT_STRESS;
  let target: URL;
  try {
    target = new URL(b.target || d.target);
  }
  catch {
    return {error: "the target is not a URL"};
  }
  if (!/^https?:$/.test(target.protocol)) return {error: "the target must be http or https"};
  if (FORBIDDEN_HOSTS.has(target.hostname)) return {error: `${target.hostname} is production: never load it`};
  const stages = buildStages(b.stageInput ?? d.stageInput);
  if (!stages.some(st => st.rate > 0)) return {error: "no stages"};
  const mix = {...DEFAULT_MIX, ...b.mix, levels: b.mix?.levels ?? DEFAULT_MIX.levels};
  const db = openDb();
  let urls: string[], byLevel: Record<string, {urls: number}>, placeIds: string[];
  try {
    ({urls, byLevel} = buildUrls(db, mix));
    placeIds = probePlaces(db);
  }
  finally {
    db.close();
  }
  if (!urls.length) return {error: "the URL list is empty: give some levels a share"};
  const config: StressConfig = {
    target: target.origin, stages, cap: Math.max(1, Number(b.cap ?? d.cap)), timeoutMs: Math.max(1000, Number(b.timeoutMs ?? d.timeoutMs)),
    hitMargin: Number(b.hitMargin ?? d.hitMargin), hitRule: b.hitRule === "best" ? "best" : "total", stop: {...d.stop, ...b.stop},
    probe: {tesseract: b.tesseract || d.tesseract, everyS: 10, placeIds}, monitorUrl: b.monitorUrl || undefined
  };
  const id = newId("-stress");
  mkdirSync(runDir(id), {recursive: true});
  writeFileSync(join(runDir(id), "config.json"), JSON.stringify(config, null, 1));
  writeFileSync(join(runDir(id), "url-mix.json"), JSON.stringify({mix, byLevel}, null, 1));
  writeFileSync(join(runDir(id), "urls.txt"), urls.join("\n") + "\n");
  const levelsCount = Object.fromEntries(Object.entries(byLevel).map(([k, v]) => [k, v.urls]));
  const meta: Meta = {
    id, mode: "stress", startedAt: new Date().toISOString(), reports: urls.length, levels: levelsCount, tesseract: config.probe.tesseract, redis: "",
    stress: {target: config.target, stages: stages.filter(st => st.rate > 0).length, seconds: stages.reduce((n, st) => n + st.seconds, 0), rates: stages.filter(st => st.rate > 0).map(st => st.rate)}
  };
  const log = openSync(join(runDir(id), "output.log"), "a");
  const child = spawn(TSX, [join(ROOT, "scripts/cache/stress.ts"), "--out", runDir(id)], {cwd: ROOT, env: process.env, stdio: ["ignore", log, log]});
  closeSync(log);
  meta.pid = child.pid;
  saveMeta(meta);
  current = {meta, child};
  child.on("exit", code => {
    meta.endedAt = new Date().toISOString();
    meta.exitCode = code;
    saveMeta(meta);
    if (current?.meta.id === id) current = null;
  });
  return {id};
}

let monitorRun: {meta: Meta; child: ChildProcess} | null = null;

/** Starts the read-only Redis sampler (scripts/cache/monitor.ts) in its own run folder. */
function startMonitor(intervalMs: number, keys: number): {id?: string; error?: string} {
  if (!REDIS_URL) return {error: "the monitor needs REDIS_URL"};
  if (monitorRun) return {error: `the monitor is already sampling (${monitorRun.meta.id})`};
  const id = newId("-monitor");
  mkdirSync(runDir(id), {recursive: true});
  const interval = Math.max(250, Number(intervalMs) || 1000), n = Math.max(1, Math.min(1000, Number(keys) || 100));
  const meta: Meta = {id, mode: "monitor", startedAt: new Date().toISOString(), reports: 0, levels: {}, tesseract: "", redis: redisShown, monitor: {intervalMs: interval, keys: n}};
  const log = openSync(join(runDir(id), "output.log"), "a");
  const child = spawn(TSX, [join(ROOT, "scripts/cache/monitor.ts"), "--out", runDir(id), "--interval", String(interval), "--keys", String(n)], {cwd: ROOT, env: process.env, stdio: ["ignore", log, log]});
  closeSync(log);
  meta.pid = child.pid;
  saveMeta(meta);
  monitorRun = {meta, child};
  child.on("exit", code => {
    meta.endedAt = new Date().toISOString();
    meta.exitCode = code;
    saveMeta(meta);
    if (monitorRun?.meta.id === id) monitorRun = null;
  });
  return {id};
}

function stopMonitor(): {ok?: boolean; error?: string} {
  if (!monitorRun) return {error: "the monitor isn't sampling"};
  monitorRun.meta.stoppedByUser = true;
  saveMeta(monitorRun.meta);
  monitorRun.child.kill("SIGTERM");
  return {ok: true};
}

/** The newest monitor run, or the one asked for. */
function monitorRunId(id?: string | null): string | null {
  if (id && readMeta(id)?.mode === "monitor") return id;
  if (monitorRun) return monitorRun.meta.id;
  return null;
}

function monitorStatus(id: string | null, minutes: number) {
  if (!id) return {id: null, samples: 0, latest: null, series: [], keys: 0, file: ""};
  const file = join(runDir(id), "samples.jsonl");
  // about 800 bytes a sample: enough for the window asked for at 1 s, more at a longer interval
  const samples = parseSamples(tail(file, Math.min(64_000_000, Math.max(200_000, minutes * 60 * 900))));
  const keys = existsSync(join(runDir(id), "keys.json")) ? (JSON.parse(readFileSync(join(runDir(id), "keys.json"), "utf8")) as string[]).length : 0;
  return {id, samples: samples.length, latest: monitorLatest(samples), series: monitorSeries(samples, minutes), keys, file};
}

function stopRun(): {ok?: boolean; error?: string} {
  if (!current) return {error: "no run is going"};
  current.meta.stoppedByUser = true;
  saveMeta(current.meta);
  current.child.kill("SIGTERM");
  return {ok: true};
}

/** The last `bytes` of a file, starting at a line boundary. */
function tail(path: string, bytes: number): string {
  if (!existsSync(path)) return "";
  const size = statSync(path).size;
  const start = Math.max(0, size - bytes);
  const fd = openSync(path, "r");
  try {
    const buf = Buffer.alloc(size - start);
    readSync(fd, buf, 0, buf.length, start);
    const text = buf.toString("utf8");
    return start > 0 ? text.slice(text.indexOf("\n") + 1) : text;
  }
  finally {
    closeSync(fd);
  }
}

const jsonLines = (text: string) => text.split("\n").filter(Boolean).flatMap(l => {
  try {
    return [JSON.parse(l) as Record<string, unknown>];
  }
  catch {
    return [];
  }
});

function runStatus(id: string) {
  const meta = readMeta(id);
  if (!meta) return null;
  const dir = runDir(id);
  if (meta.mode === "stress" || meta.mode === "monitor") {
    const running = meta.mode === "stress" ? current?.meta.id === id : monitorRun?.meta.id === id;
    const stress = meta.mode === "stress" ? stressStatus(dir, tail) : null;
    const finished = stress?.events.some(e => e.type === "finished");
    const state = running ? (meta.stoppedByUser ? "stopping" : "running")
      : meta.mode === "monitor" ? (meta.endedAt ? "stopped" : "interrupted")
      : finished ? ((stress?.summary?.stoppedBy as {reason?: string} | null)?.reason ? "stopped" : "finished")
      : meta.endedAt ? (meta.exitCode === 0 ? "finished" : "failed")
      : "interrupted";
    return {
      meta, state, stress, progress: null, done: {}, events: [], status: "", summary: null,
      output: tail(join(dir, "output.log"), 6_000).split("\n").filter(l => !/ExperimentalWarning|trace-warnings/.test(l)).slice(-30).join("\n")
    };
  }
  const progress = jsonLines(tail(join(dir, "progress.jsonl"), 64_000)).pop() ?? null;
  const events = existsSync(join(dir, "events.jsonl")) ? jsonLines(readFileSync(join(dir, "events.jsonl"), "utf8")) : [];
  // finished groups per level: rendered, already cached, failed
  const done: Record<string, {rendered: number; cached: number; errors: number; incomplete: number; lastS: number}> = {};
  for (const e of events) {
    if (typeof e.level !== "string" || typeof e.rendered !== "number") continue;
    const key = e.level.replace("/", "|");
    const d = done[key] ??= {rendered: 0, cached: 0, errors: 0, incomplete: 0, lastS: 0};
    d.rendered += e.rendered as number;
    d.cached += (e.fullHits as number) ?? 0;
    d.errors += (e.errors as number) ?? 0;
    d.incomplete += (e.incomplete as number) ?? 0;
    d.lastS = (e.elapsedS as number) ?? 0;
  }
  const notable = events.filter(e => !("rendered" in e) || "finished" in e).slice(-40);
  const running = current?.meta.id === id;
  const finished = events.some(e => e.finished);
  const state = running ? (meta.stoppedByUser ? "stopping" : "running")
    : finished ? "finished"
    : meta.stoppedByUser ? "stopped"
    : meta.endedAt ? (meta.exitCode === 0 ? "finished" : "failed")
    : "interrupted";
  return {
    meta, state, progress, done, events: notable,
    status: existsSync(join(dir, "status.txt")) ? readFileSync(join(dir, "status.txt"), "utf8") : "",
    output: tail(join(dir, "output.log"), 6_000).split("\n").filter(l => !/ExperimentalWarning|trace-warnings/.test(l)).slice(-30).join("\n"),
    summary: existsSync(join(dir, "summary.json")) ? (() => {
      const s = JSON.parse(readFileSync(join(dir, "summary.json"), "utf8")) as Record<string, unknown>;
      return {wallS: s.wallS, reports: s.reports, upstream: (s.upstream as Record<string, unknown> | undefined)?.sent};
    })() : null
  };
}

function listRuns() {
  if (!existsSync(RUNS)) return [];
  return readdirSync(RUNS).filter(d => existsSync(metaPath(d))).sort().reverse().slice(0, 50).map(id => {
    const s = runStatus(id)!;
    if (s.stress || s.meta.mode === "monitor") {
      const m = s.meta;
      const stages = (s.stress?.summary?.stages ?? []) as {finished?: number}[];
      const startS = Date.parse(m.startedAt) / 1000, endS = m.endedAt ? Date.parse(m.endedAt) / 1000 : Date.now() / 1000;
      const what = m.stress ? `${m.stress.target}, ${m.stress.rates.join(", ")} pages/s` : `Redis ${m.redis}, every ${m.monitor?.intervalMs ?? 1000} ms`;
      return {
        id, mode: m.mode, state: s.state, startedAt: m.startedAt, endedAt: m.endedAt ?? null, reports: m.reports, levels: m.levels, generators: null, cubes: null, what,
        done: m.mode === "stress" ? stages.reduce((n, st) => n + (st.finished ?? 0), 0) : null, elapsedS: endS - startS, wallS: m.endedAt ? endS - startS : null
      };
    }
    const reports = (s.progress?.reports ?? {}) as Record<string, number>;
    return {
      id, mode: s.meta.mode, state: s.state, startedAt: s.meta.startedAt, endedAt: s.meta.endedAt ?? null, reports: s.meta.reports, levels: s.meta.levels,
      generators: s.meta.generators ?? null, cubes: s.meta.cubes ?? null,
      done: (reports.rendered ?? 0) + (reports.fullHits ?? 0) + (reports.errors ?? 0),
      elapsedS: (s.progress?.elapsedS as number | undefined) ?? null, wallS: (s.summary?.wallS as number | undefined) ?? null
    };
  });
}

// ---------------------------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------------------------

const send = (res: http.ServerResponse, status: number, body: unknown, type = "application/json") => {
  res.writeHead(status, {"content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff"});
  res.end(type === "application/json" ? JSON.stringify(body) : String(body));
};

const readBody = (req: http.IncomingMessage) => new Promise<string>((ok, fail) => {
  let data = "";
  req.on("data", c => {
    data += c;
    if (data.length > 100_000) req.destroy();
  });
  req.on("end", () => ok(data));
  req.on("error", fail);
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", "http://localhost");
    if (req.method === "GET" && url.pathname === "/") return send(res, 200, PAGE, "text/html; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/api/monitor") {
      const minutes = Math.max(1, Math.min(24 * 60, Number(url.searchParams.get("minutes") ?? 15)));
      return send(res, 200, monitorStatus(monitorRunId(url.searchParams.get("id")), minutes));
    }
    if (req.method === "GET" && url.pathname === "/api/monitor/latest") {
      // for a stress run on another machine, through this UI's tunnel
      const s = monitorStatus(monitorRunId(null), 1);
      return send(res, 200, {id: s.id, latest: s.latest ? {...s.latest, host: undefined} : null, host: s.latest?.host ?? null});
    }
    if (req.method === "GET" && url.pathname === "/api/info" && !WARM) {
      // no warm: no Redis connection here, no levels for --monitor-only (the Stress mode reads them)
      return send(res, 200, {
        monitorOnly: MONITOR_ONLY, warm: false, stressMode: STRESS, tesseract: TESSERACT, redis: redisShown, runsDir: RUNS, lock: null, current: current?.meta.id ?? null, preparing,
        defaults: DEFAULTS, redisMemory: 0, redisMax: 0, redisKeys: null, levels: STRESS ? levels() : [], generators: [], cubes: [],
        stress: STRESS ? {...DEFAULT_STRESS, mix: DEFAULT_MIX} : null,
        monitor: REDIS_URL ? {current: monitorRun?.meta.id ?? null, redis: redisShown} : null
      });
    }
    if (req.method === "GET" && url.pathname === "/api/info") {
      const holder = await redis.get("warm:batch:lock").catch(() => null);
      const info = await redis.info("memory").catch(() => "");
      return send(res, 200, {
        tesseract: TESSERACT, redis: redisShown, runsDir: RUNS, lock: holder, current: current?.meta.id ?? null, preparing, defaults: DEFAULTS,
        redisMemory: Number(info.match(/used_memory:(\d+)/)?.[1] ?? 0), redisMax: Number(info.match(/maxmemory:(\d+)/)?.[1] ?? 0),
        redisKeys: await redis.dbsize().catch(() => 0), levels: levels(), generators: GENERATORS, cubes: await knownCubes(),
        monitorOnly: false, warm: true, stressMode: STRESS, stress: {...DEFAULT_STRESS, mix: DEFAULT_MIX},
        monitor: {current: monitorRun?.meta.id ?? null, redis: redisShown}
      });
    }
    if (req.method === "GET" && url.pathname === "/api/runs") return send(res, 200, listRuns());
    const m = url.pathname.match(/^\/api\/runs\/([\w-]+)$/);
    if (req.method === "GET" && m) {
      const s = runStatus(m[1]);
      return s ? send(res, 200, s) : send(res, 404, {error: "no such run"});
    }
    if (req.method === "POST") {
      if (req.headers["x-warm-ui"] !== "1") return send(res, 403, {error: "missing X-Warm-UI header"});
      if (url.pathname === "/api/monitor/start") {
        const b = JSON.parse(await readBody(req) || "{}") as {interval?: number; keys?: number};
        const r = startMonitor(b.interval ?? MONITOR_INTERVAL, b.keys ?? MONITOR_KEYS);
        return send(res, r.error ? 409 : 200, r);
      }
      if (url.pathname === "/api/monitor/stop") {
        const r = stopMonitor();
        return send(res, r.error ? 409 : 200, r);
      }
      if (MONITOR_ONLY) return send(res, 403, {error: "this UI was started with --monitor-only"});
      if (url.pathname === "/api/stress/urls") {
        const b = JSON.parse(await readBody(req) || "{}") as {mix?: UrlMix};
        const db = openDb();
        try {
          const {urls, byLevel} = buildUrls(db, {...DEFAULT_MIX, ...b.mix, levels: b.mix?.levels ?? DEFAULT_MIX.levels});
          return send(res, 200, {urls: urls.length, distinct: new Set(urls).size, byLevel, sample: urls.slice(0, 20)});
        }
        finally {
          db.close();
        }
      }
      if (url.pathname === "/api/runs") {
        const r = await startRun(JSON.parse(await readBody(req) || "{}") as StartBody);
        return send(res, r.error ? 409 : 200, r);
      }
      if (url.pathname === "/api/stop") {
        const r = stopRun();
        return send(res, r.error ? 409 : 200, r);
      }
    }
    send(res, 404, {error: "not found"});
  }
  catch (error) {
    send(res, 500, {error: (error as Error).message});
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`warm UI on http://127.0.0.1:${PORT}  (${MONITOR_ONLY ? "monitor only" : WARM ? "warm, stress and monitor" : "stress" + (REDIS_URL ? " and monitor" : "") + " only"}; Tesseract ${TESSERACT || "-"}, Redis ${redisShown || "-"}, runs in ${RUNS})`);
  if (MONITOR_AT_START) {
    const r = startMonitor(MONITOR_INTERVAL, MONITOR_KEYS);
    console.log(r.error ? `monitor: ${r.error}` : `monitor sampling into ${join(runDir(r.id!), "samples.jsonl")}`);
  }
});

const shutdown = () => {
  if (current) {
    console.log(`stopping run ${current.meta.id}`);
    stopRun();
  }
  if (monitorRun) {
    console.log(`stopping the monitor ${monitorRun.meta.id}`);
    stopMonitor();
  }
  server.close();
  setTimeout(() => process.exit(0), current || monitorRun ? 3000 : 0);
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

// ---------------------------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------------------------

const PAGE = /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cache Warm</title>
<style>
:root{--bg:#f5f7f8;--panel:#fff;--fg:#162029;--muted:#5a6672;--line:#d3dae0;--accent:#0b6e66;--accent-soft:#d8eeeb;--warn:#a2541a;--warn-soft:#f6e6d8;--bad:#b42318;--bad-soft:#fbe4e1;
--sans:system-ui,-apple-system,"Segoe UI",sans-serif;--mono:ui-monospace,Menlo,monospace;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#11161b;--panel:#192028;--fg:#e4e9ee;--muted:#9aa6b2;--line:#33404c;--accent:#5cc8bb;--accent-soft:#17332f;--warn:#f0a36a;--warn-soft:#3a2617;--bad:#ff8a7a;--bad-soft:#3d1c19;color-scheme:dark}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 var(--sans)}
main{max-width:1100px;margin:0 auto;padding:24px 16px 48px;display:grid;gap:20px}
h1{font-size:1.4rem;margin:0}h2{font-size:1rem;margin:0}
.card{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:16px;display:grid;gap:12px;min-width:0}
.muted{color:var(--muted)}.row{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}
table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:middle}
th{font-size:12px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.04em}
td.n,th.n{text-align:right}tr:last-child td{border-bottom:0}
.scroll{overflow-x:auto}
input[type=number]{width:72px;padding:3px 6px;font:inherit;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px}
input[type=text]{width:min(100%,520px);padding:5px 8px;font:inherit;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px}
select{padding:3px 6px;font:inherit;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px}
button{font:inherit;padding:6px 14px;border-radius:5px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
button.primary{background:var(--accent);border-color:var(--accent);color:var(--panel);font-weight:600}
button.danger{border-color:var(--bad);color:var(--bad)}
button:disabled{opacity:.5;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.tabs{display:flex;flex-wrap:wrap;gap:6px}.tabs label{border:1px solid var(--line);border-radius:5px;padding:6px 12px;cursor:pointer}
.tabs input{position:absolute;opacity:0}.tabs label:has(input:checked){background:var(--accent-soft);border-color:var(--accent);color:var(--accent);font-weight:600}
.tabs label:has(input:focus-visible){outline:2px solid var(--accent);outline-offset:1px}
.pill{display:inline-block;padding:1px 10px;border-radius:999px;font-size:12px;font-weight:600;background:var(--accent-soft);color:var(--accent)}
.pill.warn{background:var(--warn-soft);color:var(--warn)}.pill.bad{background:var(--bad-soft);color:var(--bad)}.pill.idle{background:var(--bg);color:var(--muted)}
.bar{height:10px;background:var(--bg);border-radius:5px;overflow:hidden;border:1px solid var(--line)}.bar>div{height:100%;background:var(--accent)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.kpi{border:1px solid var(--line);border-radius:5px;padding:8px 10px}.kpi b{display:block;font-size:1.15rem;font-variant-numeric:tabular-nums}.kpi span{font-size:12px;color:var(--muted)}
pre{margin:0;font:12px/1.45 var(--mono);white-space:pre;overflow-x:auto;background:var(--bg);border:1px solid var(--line);border-radius:5px;padding:10px;max-height:360px}
.err{color:var(--bad)}details summary{cursor:pointer;color:var(--muted)}
.help{color:var(--muted);max-width:75ch;margin:0}
a{color:var(--accent);cursor:pointer}
${PANELS_CSS}
</style></head><body><main>
<header class="row" style="justify-content:space-between"><h1>Cache warm</h1><span class="muted" id="conn"></span></header>

<section class="card" id="startCard">
  <h2>Start a run</h2>
  <div class="tabs" role="radiogroup" aria-label="Strategy">
    <label><input type="radio" name="mode" value="site"> Whole site</label>
    <label><input type="radio" name="mode" value="levels" checked> Profiles and levels</label>
    <label><input type="radio" name="mode" value="generators"> Generators</label>
    <label><input type="radio" name="mode" value="cubes"> Cubes</label>
    <label><input type="radio" name="mode" value="stress"> Stress</label>
  </div>
  <p class="help" id="noWarm" hidden>Warm strategies need <code>NEXT_PUBLIC_TESSERACT_URL</code> and <code>REDIS_URL</code>; this UI was started without them, for the Stress mode.</p>

  <div data-panel="site" hidden>
    <p class="help">Every report of every published level (<span id="siteTotal"></span>). Reports already in the cache are skipped, so this also completes a partial warm.</p>
  </div>

  <div data-panel="levels">
    <div class="row" style="justify-content:space-between"><p class="help">Pick levels and which of their members. Reports already in the cache are skipped.</p>
      <div class="row"><span class="muted">Select:</span><a data-sel="none">none</a><a data-sel="geo">geo</a><a data-sel="states">states and counties</a><a data-sel="all">all</a></div></div>
    <div class="scroll"><table><thead><tr><th></th><th>Profile</th><th>Level</th><th class="n">Members</th><th>Which members</th><th class="n">Reports</th></tr></thead><tbody id="levels"></tbody></table></div>
  </div>

  <div data-panel="generators" hidden>
    <p class="help">After a generator's code changes, its outputs get a new version and count as missing, so a run computes only those, for every profile that has the generator. Tick "recompute" to also refresh outputs whose code didn't change.</p>
    <label class="row" style="gap:8px">Generator ids <input type="text" id="genIds" placeholder="for example 8, 652, 664" autocomplete="off"></label>
    <div id="genInfo" class="muted"></div>
    <label class="row" style="gap:6px"><input type="checkbox" id="genLimit"> Only the levels ticked under "Profiles and levels" (otherwise every level of these profiles)</label>
    <label class="row" style="gap:6px"><input type="checkbox" id="genRecompute"> Recompute even if cached (deletes their current outputs first)</label>
  </div>

  <div data-panel="cubes" hidden>
    <p class="help">For a data release. Purges the cubes (as <code>npm run cache:purge</code> does), then recomputes what read them: every report of the profiles whose generators name these cubes, plus the reports the cache lists as reading them. It also works when the cubes were already purged elsewhere (untick the box). Without a purge, Force overwrites only the outputs of the generators that name these cubes. Generators reading these cubes that failed before are tried again.</p>
    <label class="row" style="gap:8px">Cubes <input type="text" id="cubeNames" list="cubeList" placeholder="for example acs_yg_total_population_5, pums_5" autocomplete="off"></label>
    <datalist id="cubeList"></datalist>
    <div id="cubeInfo" class="muted"></div>
    <label class="row" style="gap:6px"><input type="checkbox" id="cubePurge" checked> Purge them first (untick if they were already purged)</label>
  </div>

${STRESS_PANEL}
  <div class="row" id="settings"></div>
  <div class="row"><button class="primary" id="start">Start</button><span id="planInfo" class="muted"></span><span id="startMsg" class="err"></span></div>
</section>

<section class="card" id="runCard" hidden>
  <div class="row" style="justify-content:space-between"><div class="row"><h2 id="runTitle"></h2><span class="pill" id="runState"></span></div>
    <div class="row"><button class="danger" id="stop" hidden>Stop</button></div></div>
  <div class="muted" id="runWhat"></div>
  <div class="bar"><div id="runBar" style="width:0"></div></div>
  <div class="muted" id="runLine"></div>
  <div class="kpis" id="kpis"></div>
  <div class="scroll"><table><thead><tr><th>Level</th><th class="n">Done</th><th class="n">Planned</th><th class="n">Rendered</th><th class="n">Already cached</th><th class="n">Incomplete</th><th class="n">Errors</th><th style="width:30%"></th></tr></thead><tbody id="runLevels"></tbody></table></div>
  <details><summary>Events</summary><pre id="events"></pre></details>
  <details><summary>Status page from the warmer</summary><pre id="statusTxt"></pre></details>
  <details><summary>Output</summary><pre id="output"></pre></details>
</section>

${STRESS_CARD}
${MONITOR_CARD}

<section class="card">
  <h2>Runs</h2>
  <div class="scroll"><table><thead><tr><th>Started</th><th>Strategy</th><th>State</th><th>What</th><th class="n">Reports</th><th class="n">Done</th><th class="n">Time</th></tr></thead><tbody id="runs"></tbody></table></div>
</section>
</main>
<script>
const $ = id => document.getElementById(id);
const fmtN = n => (n ?? 0).toLocaleString("en-US");
const fmtS = s => s == null ? "" : s >= 3600 ? Math.floor(s/3600) + " h " + String(Math.floor(s%3600/60)).padStart(2,"0") + " min" : s >= 60 ? Math.floor(s/60) + " min " + String(Math.round(s%60)).padStart(2,"0") + " s" : Math.round(s) + " s";
const fmtB = b => b >= 1e9 ? (b/1e9).toFixed(2) + " GB" : (b/1e6).toFixed(0) + " MB";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const label = k => k.replace("|", " / ");
const MODE_NAMES = {site: "Whole site", levels: "Profiles", generators: "Generators", cubes: "Cubes", stress: "Stress", monitor: "Monitor"};
let info = null, viewing = null, levelsState = {}, mode = "levels";
const SETTINGS = [["workers","Workers"],["cap","Cap start"],["maxCap","Cap max"],["heavy","RCA and calcs at once"],["geoRate","Geoservice req/s"]];

async function api(path, body) {
  const r = await fetch(path, body ? {method: "POST", headers: {"content-type": "application/json", "x-warm-ui": "1"}, body: JSON.stringify(body)} : {});
  return r.json();
}

const count = (l, s) => s.mode === "all" ? l.members : s.mode === "top" ? Math.min(l.members, Math.max(1, Math.floor(s.n))) : Math.max(1, Math.round(l.members * Math.min(100, s.n) / 100));
const parseIds = () => Array.from(new Set($("genIds").value.split(/[^0-9]+/).filter(Boolean).map(Number)));
const parseCubes = () => Array.from(new Set($("cubeNames").value.split(",").map(s => s.trim()).filter(Boolean)));
// the server's \`cubeMatches\`: a \`*\` in a generator's cube stands for a part filled from the attributes
function cubeMatch(pattern, cube) {
  const parts = pattern.split("*");
  if (parts.length === 1) return pattern === cube;
  const first = parts[0], last = parts[parts.length - 1];
  if (cube.length < first.length + last.length || !cube.startsWith(first) || !cube.endsWith(last)) return false;
  let at = first.length;
  for (const part of parts.slice(1, -1)) {
    const found = cube.indexOf(part, at);
    if (found < 0) return false;
    at = found + part.length;
  }
  return at <= cube.length - last.length;
}

function renderLevels() {
  $("levels").innerHTML = info.levels.map(l => {
    const s = levelsState[l.key] ??= {on: false, mode: "all", n: l.members > 300 ? 10 : 100};
    return '<tr><td><input type="checkbox" aria-label="' + esc(label(l.key)) + '" data-k="' + esc(l.key) + '" data-f="on"' + (s.on ? " checked" : "") + '></td><td>' + esc(l.profile) + '</td><td>' + esc(l.hierarchy) + '</td><td class="n">' + fmtN(l.members) + '</td>' +
      '<td><select data-k="' + esc(l.key) + '" data-f="mode"><option value="all"' + (s.mode==="all"?" selected":"") + '>all</option><option value="top"' + (s.mode==="top"?" selected":"") + '>largest N</option><option value="sample"' + (s.mode==="sample"?" selected":"") + '>random %</option></select> ' +
      (s.mode === "all" ? "" : '<input type="number" min="1" data-k="' + esc(l.key) + '" data-f="n" value="' + s.n + '"> ' + (s.mode === "top" ? "members" : "%")) + '</td>' +
      '<td class="n">' + (s.on ? fmtN(count(l, s)) : "") + '</td></tr>';
  }).join("");
  updatePlanInfo();
}

/** What Start would do, and whether it can. */
function updatePlanInfo() {
  let text = "", ok = false;
  if (mode === "site") {
    const t = info.levels.reduce((n, l) => n + l.members, 0);
    text = fmtN(t) + " reports"; ok = t > 0;
  }
  else if (mode === "levels") {
    const t = info.levels.reduce((n, l) => n + (levelsState[l.key]?.on ? count(l, levelsState[l.key]) : 0), 0);
    text = t ? fmtN(t) + " reports" : "Pick at least one level"; ok = t > 0;
  }
  else if (mode === "generators") {
    const ids = parseIds();
    const found = info.generators.filter(g => ids.includes(g.id));
    const unknown = ids.filter(id => !found.some(g => g.id === id));
    const profiles = Array.from(new Set(found.map(g => g.profile)));
    const limited = $("genLimit").checked;
    const reports = info.levels.filter(l => profiles.includes(l.profile) && (!limited || levelsState[l.key]?.on)).reduce((n, l) => n + (limited ? count(l, levelsState[l.key]) : l.members), 0);
    $("genInfo").innerHTML = found.map(g => esc(g.id + " " + g.name + " (" + g.profile + ")")).join("<br>") + (unknown.length ? '<br><span class="err">Unknown: ' + esc(unknown.join(", ")) + '</span>' : "");
    text = found.length ? "Checks " + fmtN(reports) + " " + profiles.join(" and ") + " reports; computes only these generators' missing outputs" : "Enter at least one generator id";
    ok = found.length > 0;
  }
  else if (mode === "cubes") {
    const names = parseCubes();
    const unknown = names.filter(n => !info.cubes.includes(n));
    const readers = info.generators.filter(g => (g.cubes || []).some(c => names.some(n => cubeMatch(c, n))));
    const profiles = Array.from(new Set(readers.map(g => g.profile)));
    const reports = info.levels.filter(l => profiles.includes(l.profile)).reduce((n, l) => n + l.members, 0);
    $("cubeInfo").innerHTML = (readers.length ? "Generators naming them: " + esc(readers.map(g => g.id + " (" + g.profile + ")").join(", ")) : "No generator names them in its URL")
      + (unknown.length ? '<br><span class="err">No cached output reads: ' + esc(unknown.join(", ")) + '</span>' : "");
    text = names.length ? (readers.length ? "Checks " + fmtN(reports) + " " + profiles.join(" and ") + " reports, plus those the cache lists" : "The reports are found from the cache when you start") : "Enter at least one cube";
    ok = names.length > 0;
  }
  else if (mode === "stress") {
    const st = stagesOf(stageInput());
    text = st.some(x => x.rate > 0) ? "Sends load to " + $("stTarget").value : "Enter at least one rate";
    ok = st.some(x => x.rate > 0) && $("stTarget").value.trim() !== "";
  }
  $("planInfo").textContent = info.preparing ? "Preparing the previous request…" : text;
  $("start").disabled = !ok || Boolean(info.current) || (mode !== "stress" && Boolean(info.lock)) || Boolean(info.preparing) || (mode !== "stress" && !info.warm);
}

$("levels").addEventListener("change", e => {
  const k = e.target.dataset.k, f = e.target.dataset.f; if (!k) return;
  const s = levelsState[k];
  if (f === "on") s.on = e.target.checked; else if (f === "mode") s.mode = e.target.value; else s.n = Number(e.target.value) || 1;
  renderLevels();
});
document.querySelectorAll("[data-sel]").forEach(a => a.addEventListener("click", () => {
  const sel = a.dataset.sel;
  for (const l of info.levels) levelsState[l.key].on = sel === "all" || (sel === "geo" && l.profile === "geo") || (sel === "states" && l.profile === "geo" && ["Nation","State","County"].includes(l.hierarchy));
  renderLevels();
}));
document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener("change", () => {
  mode = r.value;
  document.querySelectorAll("[data-panel]").forEach(p => { p.hidden = p.dataset.panel !== mode; });
  $("start").textContent = {site: "Warm the whole site", levels: "Start", generators: "Recompute these generators", cubes: "Purge and recompute", stress: "Start the stress run"}[mode];
  $("settings").hidden = mode === "stress";
  updatePlanInfo();
}));
["genIds", "cubeNames"].forEach(id => $(id).addEventListener("input", updatePlanInfo));
$("genLimit").addEventListener("change", updatePlanInfo);
$("cubePurge").addEventListener("change", () => { $("start").textContent = $("cubePurge").checked ? "Purge and recompute" : "Recompute"; });

function renderSettings() {
  $("settings").innerHTML = SETTINGS.map(([k, lbl]) => '<label class="row" style="gap:6px">' + lbl + ' <input type="number" min="1" id="set_' + k + '" value="' + info.defaults[k] + '"></label>').join("") +
    '<label class="row" style="gap:6px"><input type="checkbox" id="set_force"> Re-render reports already cached</label>';
}

$("start").addEventListener("click", async () => {
  $("startMsg").textContent = "";
  if (mode === "stress") {
    const b = stressBody();
    const st = stagesOf(b.stageInput).filter(x => x.rate > 0);
    if (!confirm("Send load to " + b.target + "?" + String.fromCharCode(10) + "Stages: " + st.map(x => x.rate + "/s for " + x.seconds + " s").join(", ") + String.fromCharCode(10) + "Agree a time window with the team first.")) return;
    $("start").disabled = true; $("planInfo").textContent = "Building the URL list…";
    const r = await api("/api/runs", {mode: "stress", stress: b});
    if (r.error) $("startMsg").textContent = r.error;
    else viewing = r.id;
    await refresh();
    return;
  }
  const settings = Object.fromEntries(SETTINGS.map(([k]) => [k, Number($("set_" + k).value)]));
  settings.force = $("set_force").checked;
  const body = {mode, settings};
  if (mode === "levels") body.picks = info.levels.filter(l => levelsState[l.key].on).map(l => ({key: l.key, mode: levelsState[l.key].mode, n: levelsState[l.key].n}));
  if (mode === "generators") {
    body.generators = parseIds(); body.recompute = $("genRecompute").checked;
    if ($("genLimit").checked) body.picks = info.levels.filter(l => levelsState[l.key].on).map(l => ({key: l.key, mode: levelsState[l.key].mode, n: levelsState[l.key].n}));
  }
  if (mode === "cubes") { body.cubes = parseCubes(); body.purge = $("cubePurge").checked; }
  $("start").disabled = true;
  $("planInfo").textContent = mode === "cubes" || (mode === "generators" && body.recompute) ? "Clearing the cache entries first…" : "Starting…";
  const r = await api("/api/runs", body);
  if (r.error) $("startMsg").textContent = r.error;
  else viewing = r.id;
  await refresh();
});
$("stop").addEventListener("click", async () => {
  $("stop").disabled = true;
  const r = await api("/api/stop", {});
  if (r.error) $("runLine").textContent = r.error;
  await refresh();
});

function kpi(v, t) { return '<div class="kpi"><b>' + v + '</b><span>' + t + '</span></div>'; }

function what(m) {
  const parts = [MODE_NAMES[m.mode] || m.mode];
  if (m.generators) parts.push("generators " + m.generators.join(", "));
  if (m.cubes) parts.push("cubes " + m.cubes.join(", "));
  if (m.prepared) parts.push(m.prepared);
  return parts.join(" · ");
}

async function renderRun() {
  if (!viewing) { $("runCard").hidden = true; return; }
  const s = await api("/api/runs/" + viewing);
  if (s.error) { $("runCard").hidden = true; $("stressCard").hidden = true; return; }
  if (s.meta.mode === "monitor") { monViewing = s.meta.id; viewing = null; $("runCard").hidden = true; $("stressCard").hidden = true; await renderMonitor(); return; }
  if (s.meta.mode === "stress") { $("runCard").hidden = true; renderStress(s); return; }
  $("stressCard").hidden = true;
  $("runCard").hidden = false;
  const p = s.progress || {}; const rep = p.reports || {};
  const done = (rep.rendered || 0) + (rep.fullHits || 0) + (rep.errors || 0);
  $("runTitle").textContent = "Run " + s.meta.id.replace("T", " ");
  const cls = {running: "", stopping: "warn", finished: "", stopped: "idle", failed: "bad", interrupted: "bad"}[s.state] ?? "idle";
  $("runState").className = "pill " + cls; $("runState").textContent = s.state;
  $("runWhat").textContent = what(s.meta);
  $("stop").hidden = s.state !== "running"; $("stop").disabled = false;
  $("runBar").style.width = (100 * done / Math.max(1, s.meta.reports)).toFixed(1) + "%";
  const elapsed = p.elapsedS;
  const eta = done && s.state === "running" ? elapsed / done * (s.meta.reports - done) : null;
  $("runLine").textContent = fmtN(done) + " of " + fmtN(s.meta.reports) + " reports in finished groups" + (elapsed != null ? " · " + fmtS(elapsed) : "") + (eta ? " · about " + fmtS(eta) + " left at this pace (levels differ)" : "") + (s.summary ? " · finished in " + fmtS(s.summary.wallS) + ", " + fmtN(s.summary.upstream) + " Tesseract requests" : "");
  const er = p.errors || {};
  $("kpis").innerHTML = p.t ? [
    kpi((p.ratePerS ?? 0) + "/s", "Tesseract requests"),
    kpi((p.inFlight ?? 0) + " / " + (p.cap ?? 0), "In flight / cap (queue " + (p.queue ?? 0) + ")"),
    kpi(fmtN(er.timeouts) + " · " + fmtN(er.s5xx), "Timeouts · 5xx"),
    kpi(fmtN(rep.fullHits), "Reports already complete"),
    kpi(p.redis ? fmtB(p.redis.usedMemory) : "", "Redis (" + fmtN(p.redis && p.redis.keys) + " keys)"),
    kpi(p.shared ? fmtB(p.shared.heldBytes || 0) : "", "Held responses")
  ].join("") : '<span class="muted">Waiting for the first progress line…</span>';
  $("runLevels").innerHTML = Object.entries(s.meta.levels).map(([k, planned]) => {
    const d = s.done[k] || {rendered: 0, cached: 0, errors: 0, incomplete: 0};
    const n = d.rendered + d.cached + d.errors;
    return '<tr><td>' + esc(label(k)) + '</td><td class="n">' + fmtN(n) + '</td><td class="n">' + fmtN(planned) + '</td><td class="n">' + fmtN(d.rendered) + '</td><td class="n">' + fmtN(d.cached) + '</td><td class="n">' + fmtN(d.incomplete) + '</td><td class="n' + (d.errors ? " err" : "") + '">' + fmtN(d.errors) + '</td>' +
      '<td><div class="bar"><div style="width:' + (100 * n / Math.max(1, planned)).toFixed(1) + '%"></div></div></td></tr>';
  }).join("");
  $("events").textContent = s.events.map(e => { const {t, ...rest} = e; return (t || "").slice(11, 19) + "  " + JSON.stringify(rest); }).join("\\n") || "No events yet";
  $("statusTxt").textContent = s.status || "Not written yet";
  $("output").textContent = s.output || "No output";
}

async function renderRuns() {
  const runs = await api("/api/runs");
  $("runs").innerHTML = runs.map(r => {
    const target = r.what ? r.what : r.generators ? "generators " + r.generators.join(", ") : r.cubes ? "cubes " + r.cubes.join(", ") : Object.keys(r.levels).map(label).join(", ");
    return '<tr><td><a data-run="' + esc(r.id) + '">' + esc(r.startedAt.slice(0, 19).replace("T", " ")) + '</a></td><td>' + esc(MODE_NAMES[r.mode] || r.mode) + '</td><td>' + esc(r.state) + '</td><td>' + esc(target) + '</td><td class="n">' + fmtN(r.reports) + '</td><td class="n">' + fmtN(r.done) + '</td><td class="n">' + fmtS(r.wallS ?? r.elapsedS) + '</td></tr>';
  }).join("") || '<tr><td colspan="7" class="muted">No runs yet</td></tr>';
  document.querySelectorAll("[data-run]").forEach(a => a.addEventListener("click", () => { viewing = a.dataset.run; renderRun(); }));
}

async function refresh() {
  info = await api("/api/info");
  if (info.monitorOnly) {
    document.title = "Redis Monitor"; document.querySelector("h1").textContent = "Redis monitor";
    $("conn").textContent = "Monitor only · Redis " + info.redis + " · runs in " + info.runsDir;
    $("startCard").hidden = true; $("runCard").hidden = true; $("stressCard").hidden = true;
    await renderMonitor();
    await renderRuns();
    return;
  }
  $("conn").textContent = info.warm
    ? "Tesseract " + info.tesseract + " · Redis " + info.redis + " (" + fmtB(info.redisMemory) + (info.redisMax ? " of " + fmtB(info.redisMax) : "") + ", " + fmtN(info.redisKeys) + " keys)" + (info.lock && !info.current ? " · lock held: " + info.lock : "")
    : "Stress mode" + (info.monitor ? " and monitor (Redis " + info.redis + ")" : "") + " · no warm (Tesseract or Redis not set)";
  if (!info.warm && !$("levels").children.length) {
    $("noWarm").hidden = false;
    document.querySelectorAll('input[name="mode"]').forEach(r => { if (r.value !== "stress") r.disabled = true; });
    const st = document.querySelector('input[name="mode"][value="stress"]');
    if (!st.checked) { st.checked = true; st.dispatchEvent(new Event("change")); }
  }
  stressDefaults();
  if (info.current && !viewing) viewing = info.current;
  // the level table is only redrawn on first load and on edits, so typing in it is never interrupted
  if (!$("levels").children.length) {
    renderSettings(); renderLevels();
    $("siteTotal").textContent = fmtN(info.levels.reduce((n, l) => n + l.members, 0)) + " reports in " + info.levels.length + " levels";
    $("cubeList").innerHTML = info.cubes.map(c => '<option value="' + esc(c) + '">').join("");
  }
  else updatePlanInfo();
  await renderRun();
  await renderMonitor();
  await renderRuns();
}
${PANELS_JS}
refresh();
setInterval(refresh, 5000);
</script></body></html>`;
