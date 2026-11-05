// A small web page to start, watch and stop the batched warmer (`npm run warm:batch`) and browse past
// runs. It builds the plan from the levels you pick, starts the warmer as a child process, and reads the
// files the warmer writes (progress.jsonl, events.jsonl, status.txt, summary.json). See
// docs/deployment.md, "Warm UI".
//
//   NEXT_PUBLIC_TESSERACT_URL=https://api-penn.datausa.io/ REDIS_URL=redis://127.0.0.1:6379 \
//     npm run warm:ui -- [--port 5560] [--runs warm-runs]
//
// It listens on 127.0.0.1 only and has no login: on a server, reach it through an SSH tunnel
// (`ssh -L 5560:127.0.0.1:5560 <host>`, then http://localhost:5560). Requests that change anything
// need an `X-Warm-UI` header, which a page on another site cannot send without CORS approval.
// One run at a time, as the warmer's own Redis lock (`warm:batch:lock`) also enforces.
import {spawn, type ChildProcess} from "node:child_process";
import {closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, readSync, statSync, writeFileSync} from "node:fs";
import http from "node:http";
import {join, resolve} from "node:path";
import {DatabaseSync} from "node:sqlite";
import Redis from "ioredis";
import {isPendingLevel} from "../../src/lib/geo/levels";

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

if (!TESSERACT || !REDIS_URL) {
  console.error("usage: NEXT_PUBLIC_TESSERACT_URL=... REDIS_URL=... npm run warm:ui -- [--port 5560] [--runs warm-runs]");
  process.exit(2);
}
mkdirSync(RUNS, {recursive: true});
const redis = new Redis(REDIS_URL, {maxRetriesPerRequest: 2, lazyConnect: false});
/** The Redis URL without its password, for display. */
const redisShown = REDIS_URL.replace(/\/\/([^:@/]*):[^@/]*@/, "//$1:***@");

// ---------------------------------------------------------------------------------------------
// Levels and plans
// ---------------------------------------------------------------------------------------------

interface Level {key: string; profile: string; hierarchy: string; members: number}

const GEO_ORDER = ["Nation", "State", "County", "MSA", "PUMA", "Congressional District", "Place"];

/** Every profile level with visible members, in the order the warmer processes them. */
function levels(): Level[] {
  const db = new DatabaseSync(DB_PATH, {readOnly: true});
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

interface Pick {key: string; mode: "all" | "top" | "sample"; n: number}

/**
 * The members of each picked level: all of them, the `n` largest by zvalue (most visited first), or
 * `n` percent at random (with the 10 largest always in).
 */
function buildPlan(picks: Pick[]): {plan: {profile: string; id: string; hierarchy: string}[]; counts: Record<string, number>} {
  const db = new DatabaseSync(DB_PATH, {readOnly: true});
  const plan: {profile: string; id: string; hierarchy: string}[] = [];
  const counts: Record<string, number> = {};
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
      counts[p.key] = chosen.length;
    }
  }
  finally {
    db.close();
  }
  return {plan, counts};
}

// ---------------------------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------------------------

interface Settings {workers: number; group: number; cap: number; maxCap: number; capStep: number; latencyFloor: number; slowP95: number; heavy: number; geoRate: number; force: boolean}

const DEFAULTS: Settings = {workers: 4, group: 300, cap: 12, maxCap: 24, capStep: 4, latencyFloor: 12, slowP95: 15000, heavy: 7, geoRate: 50, force: false};

interface Meta {
  id: string;
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
  stoppedByUser?: boolean;
  reports: number;
  levels: Record<string, number>;
  settings: Settings;
  tesseract: string;
  redis: string;
  pid?: number;
}

let current: {meta: Meta; child: ChildProcess} | null = null;

const runDir = (id: string) => join(RUNS, id);
const metaPath = (id: string) => join(runDir(id), "meta.json");
const saveMeta = (meta: Meta) => writeFileSync(metaPath(meta.id), JSON.stringify(meta, null, 1));

function readMeta(id: string): Meta | null {
  try {
    return JSON.parse(readFileSync(metaPath(id), "utf8")) as Meta;
  }
  catch {
    return null;
  }
}

async function startRun(picks: Pick[], settings: Partial<Settings>): Promise<{id?: string; error?: string}> {
  if (current) return {error: `run ${current.meta.id} is still going`};
  const holder = await redis.get("warm:batch:lock").catch(() => null);
  if (holder) return {error: `another warm run holds warm:batch:lock (${holder}). If it was killed, the lock expires within a minute.`};
  const s: Settings = {...DEFAULTS, ...settings};
  const {plan, counts} = buildPlan(picks);
  if (!plan.length) return {error: "no reports picked"};
  const id = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  mkdirSync(runDir(id), {recursive: true});
  writeFileSync(join(runDir(id), "plan.json"), JSON.stringify(plan));
  const meta: Meta = {id, startedAt: new Date().toISOString(), reports: plan.length, levels: counts, settings: s, tesseract: TESSERACT, redis: redisShown};
  const args = [
    join(ROOT, "scripts/cache/warm-batch.ts"), "--plan", join(runDir(id), "plan.json"), "--out", runDir(id),
    "--workers", String(s.workers), "--group", String(s.group), "--cap", String(s.cap), "--max-cap", String(s.maxCap),
    "--cap-step", String(s.capStep), "--latency-floor", String(s.latencyFloor), "--slow-p95", String(s.slowP95),
    "--heavy", String(s.heavy), "--geo-rate", String(s.geoRate),
    ...(s.force ? ["--force"] : [])
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
    const reports = (s.progress?.reports ?? {}) as Record<string, number>;
    return {
      id, state: s.state, startedAt: s.meta.startedAt, endedAt: s.meta.endedAt ?? null, reports: s.meta.reports, levels: s.meta.levels,
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
    if (req.method === "GET" && url.pathname === "/api/info") {
      const holder = await redis.get("warm:batch:lock").catch(() => null);
      const info = await redis.info("memory").catch(() => "");
      return send(res, 200, {
        tesseract: TESSERACT, redis: redisShown, runsDir: RUNS, lock: holder, current: current?.meta.id ?? null, defaults: DEFAULTS,
        redisMemory: Number(info.match(/used_memory:(\d+)/)?.[1] ?? 0), redisKeys: await redis.dbsize().catch(() => 0), levels: levels()
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
      if (url.pathname === "/api/runs") {
        const body = JSON.parse(await readBody(req) || "{}") as {picks?: Pick[]; settings?: Partial<Settings>};
        const r = await startRun(body.picks ?? [], body.settings ?? {});
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
  console.log(`warm UI on http://127.0.0.1:${PORT}  (Tesseract ${TESSERACT}, Redis ${redisShown}, runs in ${RUNS})`);
});

const shutdown = () => {
  if (current) {
    console.log(`stopping run ${current.meta.id}`);
    stopRun();
  }
  server.close();
  setTimeout(() => process.exit(0), current ? 3000 : 0);
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
select{padding:3px 6px;font:inherit;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:4px}
button{font:inherit;padding:6px 14px;border-radius:5px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
button.primary{background:var(--accent);border-color:var(--accent);color:var(--panel);font-weight:600}
button.danger{border-color:var(--bad);color:var(--bad)}
button:disabled{opacity:.5;cursor:default}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.pill{display:inline-block;padding:1px 10px;border-radius:999px;font-size:12px;font-weight:600;background:var(--accent-soft);color:var(--accent)}
.pill.warn{background:var(--warn-soft);color:var(--warn)}.pill.bad{background:var(--bad-soft);color:var(--bad)}.pill.idle{background:var(--bg);color:var(--muted)}
.bar{height:10px;background:var(--bg);border-radius:5px;overflow:hidden;border:1px solid var(--line)}.bar>div{height:100%;background:var(--accent)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.kpi{border:1px solid var(--line);border-radius:5px;padding:8px 10px}.kpi b{display:block;font-size:1.15rem;font-variant-numeric:tabular-nums}.kpi span{font-size:12px;color:var(--muted)}
pre{margin:0;font:12px/1.45 var(--mono);white-space:pre;overflow-x:auto;background:var(--bg);border:1px solid var(--line);border-radius:5px;padding:10px;max-height:360px}
.err{color:var(--bad)}details summary{cursor:pointer;color:var(--muted)}
a{color:var(--accent);cursor:pointer}
</style></head><body><main>
<header class="row" style="justify-content:space-between"><h1>Cache warm</h1><span class="muted" id="conn"></span></header>

<section class="card" id="startCard">
  <div class="row" style="justify-content:space-between"><h2>Start a run</h2>
    <div class="row"><span class="muted">Select:</span><a data-sel="none">none</a><a data-sel="geo">geo</a><a data-sel="states">states and counties</a><a data-sel="all">all</a></div></div>
  <div class="scroll"><table><thead><tr><th></th><th>Profile</th><th>Level</th><th class="n">Members</th><th>Which members</th><th class="n">Reports</th></tr></thead><tbody id="levels"></tbody></table></div>
  <div class="row" id="settings"></div>
  <div class="row"><button class="primary" id="start">Start</button><span id="planInfo" class="muted"></span><span id="startMsg" class="err"></span></div>
</section>

<section class="card" id="runCard" hidden>
  <div class="row" style="justify-content:space-between"><div class="row"><h2 id="runTitle"></h2><span class="pill" id="runState"></span></div>
    <div class="row"><button class="danger" id="stop" hidden>Stop</button></div></div>
  <div class="bar"><div id="runBar" style="width:0"></div></div>
  <div class="muted" id="runLine"></div>
  <div class="kpis" id="kpis"></div>
  <div class="scroll"><table><thead><tr><th>Level</th><th class="n">Done</th><th class="n">Planned</th><th class="n">Rendered</th><th class="n">Already cached</th><th class="n">Incomplete</th><th class="n">Errors</th><th style="width:30%"></th></tr></thead><tbody id="runLevels"></tbody></table></div>
  <details><summary>Events</summary><pre id="events"></pre></details>
  <details><summary>Status page from the warmer</summary><pre id="statusTxt"></pre></details>
  <details><summary>Output</summary><pre id="output"></pre></details>
</section>

<section class="card">
  <h2>Runs</h2>
  <div class="scroll"><table><thead><tr><th>Started</th><th>State</th><th>Levels</th><th class="n">Reports</th><th class="n">Done</th><th class="n">Time</th></tr></thead><tbody id="runs"></tbody></table></div>
</section>
</main>
<script>
const $ = id => document.getElementById(id);
const fmtN = n => (n ?? 0).toLocaleString("en-US");
const fmtS = s => s == null ? "" : s >= 3600 ? Math.floor(s/3600) + " h " + String(Math.floor(s%3600/60)).padStart(2,"0") + " min" : s >= 60 ? Math.floor(s/60) + " min " + String(Math.round(s%60)).padStart(2,"0") + " s" : Math.round(s) + " s";
const fmtB = b => b >= 1e9 ? (b/1e9).toFixed(2) + " GB" : (b/1e6).toFixed(0) + " MB";
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const label = k => k.replace("|", " / ");
let info = null, viewing = null, levelsState = {};
const SETTINGS = [["workers","Workers"],["cap","Cap start"],["maxCap","Cap max"],["heavy","RCA and calcs at once"],["geoRate","Geoservice req/s"]];

async function api(path, body) {
  const r = await fetch(path, body ? {method: "POST", headers: {"content-type": "application/json", "x-warm-ui": "1"}, body: JSON.stringify(body)} : {});
  return r.json();
}

function renderLevels() {
  $("levels").innerHTML = info.levels.map(l => {
    const s = levelsState[l.key] ??= {on: false, mode: "all", n: l.members > 300 ? 10 : 100};
    return '<tr><td><input type="checkbox" data-k="' + esc(l.key) + '" data-f="on"' + (s.on ? " checked" : "") + '></td><td>' + esc(l.profile) + '</td><td>' + esc(l.hierarchy) + '</td><td class="n">' + fmtN(l.members) + '</td>' +
      '<td><select data-k="' + esc(l.key) + '" data-f="mode"><option value="all"' + (s.mode==="all"?" selected":"") + '>all</option><option value="top"' + (s.mode==="top"?" selected":"") + '>largest N</option><option value="sample"' + (s.mode==="sample"?" selected":"") + '>random %</option></select> ' +
      (s.mode === "all" ? "" : '<input type="number" min="1" data-k="' + esc(l.key) + '" data-f="n" value="' + s.n + '"> ' + (s.mode === "top" ? "members" : "%")) + '</td>' +
      '<td class="n">' + (s.on ? fmtN(count(l, s)) : "") + '</td></tr>';
  }).join("");
  const total = info.levels.reduce((t, l) => t + (levelsState[l.key].on ? count(l, levelsState[l.key]) : 0), 0);
  $("planInfo").textContent = total ? fmtN(total) + " reports" : "Pick at least one level";
  $("start").disabled = !total || Boolean(info.current) || Boolean(info.lock);
}
const count = (l, s) => s.mode === "all" ? l.members : s.mode === "top" ? Math.min(l.members, Math.max(1, Math.floor(s.n))) : Math.max(1, Math.round(l.members * Math.min(100, s.n) / 100));

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

function renderSettings() {
  $("settings").innerHTML = SETTINGS.map(([k, lbl]) => '<label class="row" style="gap:6px">' + lbl + ' <input type="number" min="1" id="set_' + k + '" value="' + info.defaults[k] + '"></label>').join("") +
    '<label class="row" style="gap:6px"><input type="checkbox" id="set_force"> Re-render reports already cached</label>';
}

$("start").addEventListener("click", async () => {
  $("startMsg").textContent = "";
  const picks = info.levels.filter(l => levelsState[l.key].on).map(l => ({key: l.key, mode: levelsState[l.key].mode, n: levelsState[l.key].n}));
  const settings = Object.fromEntries(SETTINGS.map(([k]) => [k, Number($("set_" + k).value)]));
  settings.force = $("set_force").checked;
  $("start").disabled = true;
  const r = await api("/api/runs", {picks, settings});
  if (r.error) { $("startMsg").textContent = r.error; }
  else { viewing = r.id; }
  await refresh();
});
$("stop").addEventListener("click", async () => {
  $("stop").disabled = true;
  const r = await api("/api/stop", {});
  if (r.error) alertLine(r.error);
  await refresh();
});
const alertLine = t => { $("runLine").textContent = t; };

function kpi(v, t) { return '<div class="kpi"><b>' + v + '</b><span>' + t + '</span></div>'; }

async function renderRun() {
  if (!viewing) { $("runCard").hidden = true; return; }
  const s = await api("/api/runs/" + viewing);
  if (s.error) { $("runCard").hidden = true; return; }
  $("runCard").hidden = false;
  const p = s.progress || {}; const rep = p.reports || {};
  const done = (rep.rendered || 0) + (rep.fullHits || 0) + (rep.errors || 0);
  $("runTitle").textContent = "Run " + s.meta.id.replace("T", " ");
  const cls = {running: "", stopping: "warn", finished: "", stopped: "idle", failed: "bad", interrupted: "bad"}[s.state] ?? "idle";
  $("runState").className = "pill " + cls; $("runState").textContent = s.state;
  $("stop").hidden = s.state !== "running"; $("stop").disabled = false;
  $("runBar").style.width = (100 * done / Math.max(1, s.meta.reports)).toFixed(1) + "%";
  const elapsed = p.elapsedS;
  const eta = done && s.state === "running" ? elapsed / done * (s.meta.reports - done) : null;
  $("runLine").textContent = fmtN(done) + " of " + fmtN(s.meta.reports) + " reports in finished groups" + (elapsed != null ? " · " + fmtS(elapsed) : "") + (eta ? " · about " + fmtS(eta) + " left at this pace (levels differ)" : "") + (s.summary ? " · finished in " + fmtS(s.summary.wallS) : "");
  const er = p.errors || {};
  $("kpis").innerHTML = p.t ? [
    kpi((p.ratePerS ?? 0) + "/s", "Tesseract requests"),
    kpi((p.inFlight ?? 0) + " / " + (p.cap ?? 0), "In flight / cap (queue " + (p.queue ?? 0) + ")"),
    kpi(fmtN(er.timeouts) + " · " + fmtN(er.s5xx), "Timeouts · 5xx"),
    kpi(fmtN(rep.incomplete), "Reports with a failed generator"),
    kpi(p.redis ? fmtB(p.redis.usedMemory) : "", "Redis (" + fmtN(p.redis && p.redis.keys) + " keys)"),
    kpi(fmtN(p.shapes && p.shapes.verified) + " / " + fmtN(p.shapes && p.shapes.rejected), "Batch shapes passed / rejected")
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
  $("runs").innerHTML = runs.map(r => '<tr><td><a data-run="' + esc(r.id) + '">' + esc(r.startedAt.slice(0, 19).replace("T", " ")) + '</a></td><td>' + esc(r.state) + '</td><td>' + esc(Object.keys(r.levels).map(label).join(", ")) + '</td><td class="n">' + fmtN(r.reports) + '</td><td class="n">' + fmtN(r.done) + '</td><td class="n">' + fmtS(r.wallS ?? r.elapsedS) + '</td></tr>').join("") || '<tr><td colspan="6" class="muted">No runs yet</td></tr>';
  document.querySelectorAll("[data-run]").forEach(a => a.addEventListener("click", () => { viewing = a.dataset.run; renderRun(); }));
}

async function refresh() {
  info = await api("/api/info");
  $("conn").textContent = "Tesseract " + info.tesseract + " · Redis " + info.redis + " (" + fmtB(info.redisMemory) + ", " + fmtN(info.redisKeys) + " keys)" + (info.lock && !info.current ? " · lock held: " + info.lock : "");
  if (info.current && !viewing) viewing = info.current;
  // the level table is only redrawn on first load and on edits, so typing in it is never interrupted
  if (!$("levels").children.length) { renderSettings(); renderLevels(); }
  else $("start").disabled = !info.levels.some(l => levelsState[l.key].on) || Boolean(info.current) || Boolean(info.lock);
  await renderRun();
  await renderRuns();
}
refresh();
setInterval(refresh, 5000);
</script></body></html>`;
