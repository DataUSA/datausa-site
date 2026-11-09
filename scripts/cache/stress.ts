// The load generator of the warm UI's Stress mode (docs/deployment.md, "Warm UI"): cached report pages
// at fixed arrival rates (an open model), read to the end, with a Tesseract probe on the side and
// automatic stop conditions. The UI writes the run folder (config.json, urls.txt) and starts this as
// a child process; it can also run on its own:
//
//   npx tsx scripts/cache/stress.ts --out warm-runs/<id>
//
// Writes to the run folder, with timestamps in milliseconds since the epoch (UTC):
// - requests.jsonl: every request (start time, stage, URL, status, ttfb and total ms, bytes, hits/total);
// - progress.jsonl: every 2 s, the last 10 s (rates, page time quantiles, errors, cache-hit share, ...);
// - events.jsonl: stage boundaries, probe failures, the stop and its reason;
// - probe.jsonl: the Tesseract probe, one small query every 10 s;
// - summary.json: one summary per stage, rewritten as each stage ends.
//
// Run it from a machine other than the site's: on the site's host it competes with the site for CPU.
import {appendFileSync, readFileSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";

export interface Stage {label: string; rate: number; seconds: number}
export interface StressConfig {
  target: string;
  stages: Stage[];
  /** Requests in flight at most; a request due while at the cap is dropped (and counted). */
  cap: number;
  timeoutMs: number;
  /** A page is a cache hit when its hits are within this many of its total (or of the URL's best, below). */
  hitMargin: number;
  /**
   * "total": within `hitMargin` of the page's total (the brief's rule). "best": within `hitMargin` of
   * the most hits this URL has shown in the run, and above 0: for levels where some generators always
   * fail (failures are never stored, so a place can show 148/171 on every visit).
   */
  hitRule?: "total" | "best";
  stop: {
    /** Over the last `windowS` seconds of finished requests, once at least `minRequests` finished. */
    windowS: number;
    minRequests: number;
    /** 5xx, timeouts and connection errors, as a share of finished requests. */
    errorPct: number;
    /** Cache misses as a share of the pages served (200). */
    missPct: number;
    /** Requests dropped at the cap, as a share of the requests due. */
    droppedPct: number;
    /** One Tesseract probe slower than this (or failing) stops the run. */
    probeMs: number;
    /** With a monitor URL: the host's available memory below this stops the run. */
    minMemMb: number;
  };
  probe: {tesseract: string; everyS: number; placeIds: string[]};
  /** The Monitor panel's warm UI (through its tunnel), polled every 5 s: http://localhost:5561 */
  monitorUrl?: string;
}

const argv = process.argv.slice(2);
const opt = (name: string, fallback: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : fallback;
};

/** Hosts this tool refuses to load: production (see the stress-test brief, "Rules"). */
export const FORBIDDEN_HOSTS = new Set(["datausa.io", "www.datausa.io", "api.datausa.io"]);

const quantile = (sorted: number[], q: number) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : null;
const sortNum = (a: number[]) => [...a].sort((x, y) => x - y);
const r1 = (n: number | null) => n === null ? null : Math.round(n * 10) / 10;
const sleep = (ms: number) => new Promise(ok => setTimeout(ok, ms));

interface Done {
  url: string;
  /** a cache hit, by the run's rule; null when the page has no data-gen-cache */
  hit: boolean | null;
  /** start, ms since the epoch */
  t: number;
  /** finish, ms since the epoch */
  end: number;
  stage: number;
  status: number;
  ttfbMs: number | null;
  ms: number;
  bytes: number;
  hits: number | null;
  total: number | null;
  error?: string;
}

type Kind = "ok" | "error" | "timeout" | "client";
const kind = (d: Done): Kind => d.error === "timeout" ? "timeout" : d.error || d.status >= 500 || d.status === 0 ? "error" : d.status >= 400 ? "client" : "ok";

async function main() {
  const OUT = resolve(opt("out", ""));
  if (!opt("out", "")) {
    console.error("usage: tsx scripts/cache/stress.ts --out <run folder with config.json and urls.txt>");
    process.exit(2);
  }
  const cfg = JSON.parse(readFileSync(join(OUT, "config.json"), "utf8")) as StressConfig;
  const target = cfg.target.replace(/\/$/, "");
  if (FORBIDDEN_HOSTS.has(new URL(target).hostname)) {
    console.error(`refusing to load ${target}: production`);
    process.exit(2);
  }
  const urls = readFileSync(join(OUT, "urls.txt"), "utf8").split("\n").map(s => s.trim()).filter(Boolean);
  if (!urls.length) throw new Error("urls.txt is empty");

  const write = (file: string, obj: unknown) => appendFileSync(join(OUT, file), JSON.stringify(obj) + "\n");
  const event = (e: Record<string, unknown>) => {
    write("events.jsonl", {t: Date.now(), ...e});
    console.log(new Date().toISOString(), JSON.stringify(e));
  };

  const startedAt = Date.now();
  let finished = false;
  let stopReason: string | null = null;
  let stopDetail = "";
  let stopStage = 0;
  let stopT = 0;
  const controllers = new Set<AbortController>();
  const stopNow = (reason: string, detail: string) => {
    if (stopReason) return;
    stopReason = reason;
    stopDetail = detail;
    stopStage = stageIndex;
    stopT = Date.now();
    event({type: "stop", reason, detail, stage: stageIndex, label: cfg.stages[stageIndex]?.label});
    for (const c of controllers) c.abort(new Error("stopped"));
  };
  process.once("SIGTERM", () => stopNow("user", "stopped from the UI (SIGTERM)"));
  process.once("SIGINT", () => stopNow("user", "interrupted (SIGINT)"));

  // what each stage did, for summary.json
  interface StageAcc {due: number; sent: number; dropped: number; finished: Done[]; startT?: number; endT?: number; probes: number[]}
  const acc: StageAcc[] = cfg.stages.map(() => ({due: 0, sent: 0, dropped: 0, finished: [], probes: []}));
  // finished requests of the last two minutes, and due/dropped counts per second, for the windows
  let recent: Done[] = [];
  const dueBySecond = new Map<number, {due: number; dropped: number; sent: number}>();
  let inFlight = 0;
  const bestHits = new Map<string, number>();
  let stageIndex = 0;
  let urlIndex = 0;
  let lastProbe: {t: number; ms: number; ok: boolean} | null = null;
  let monitor: Record<string, unknown> | null = null;
  let monitorError: string | null = null;

  const countDue = (field: "due" | "dropped" | "sent") => {
    const sec = Math.floor(Date.now() / 1000);
    const b = dueBySecond.get(sec) ?? {due: 0, dropped: 0, sent: 0};
    b[field]++;
    dueBySecond.set(sec, b);
  };

  async function request(stage: number, path: string) {
    const c = new AbortController();
    controllers.add(c);
    const timer = setTimeout(() => c.abort(new Error("timeout")), cfg.timeoutMs);
    const t = Date.now();
    const start = performance.now();
    let status = 0, ttfbMs: number | null = null, bytes = 0, hits: number | null = null, total: number | null = null, error: string | undefined;
    try {
      const res = await fetch(target + path, {signal: c.signal, redirect: "follow", headers: {"user-agent": "datausa-warm-ui-stress/1"}});
      ttfbMs = performance.now() - start;
      status = res.status;
      // read to the end: reports stream, and the cache read happens while the page is sent
      const decoder = new TextDecoder();
      let carry = "";
      const reader = res.body?.getReader();
      while (reader) {
        const {done, value: chunk} = await reader.read();
        if (done) break;
        bytes += chunk.length;
        if (hits === null) {
          const text = carry + decoder.decode(chunk, {stream: true});
          const m = text.match(/data-gen-cache="(\d+)\/(\d+)"/);
          if (m) {
            hits = Number(m[1]);
            total = Number(m[2]);
            carry = "";
          }
          else carry = text.slice(-64);
        }
      }
    }
    catch (e) {
      const reason = (c.signal.reason as Error | undefined)?.message;
      error = reason === "timeout" ? "timeout" : reason === "stopped" ? "stopped" : ((e as Error).cause as Error | undefined)?.message ?? (e as Error).message;
    }
    finally {
      clearTimeout(timer);
      controllers.delete(c);
      inFlight--;
    }
    let hit: boolean | null = null;
    if (hits !== null && total !== null) {
      if (cfg.hitRule === "best") {
        const best = Math.max(bestHits.get(path) ?? 0, hits);
        bestHits.set(path, best);
        hit = hits > 0 && best - hits <= cfg.hitMargin;
      }
      else hit = total - hits <= cfg.hitMargin;
    }
    const d: Done = {url: path, hit, t, end: Date.now(), stage, status, ttfbMs: ttfbMs === null ? null : r1(ttfbMs), ms: r1(performance.now() - start)!, bytes, hits, total, ...(error ? {error} : {})};
    write("requests.jsonl", {t: d.t, stage, url: path, status, ttfbMs: d.ttfbMs, ms: d.ms, bytes, hits, total, hit, ...(error ? {error} : {})});
    if (error === "stopped") return;
    acc[stage].finished.push(d);
    recent.push(d);
  }

  function launch(stage: number) {
    acc[stage].due++;
    countDue("due");
    const path = urls[urlIndex++ % urls.length];
    if (inFlight >= cfg.cap) {
      acc[stage].dropped++;
      countDue("dropped");
      write("requests.jsonl", {t: Date.now(), stage, url: path, status: null, error: "dropped at the cap"});
      return;
    }
    inFlight++;
    acc[stage].sent++;
    countDue("sent");
    void request(stage, path);
  }

  /** Stats of the finished requests of the last `seconds`, and of the due ones. */
  function windowStats(seconds: number) {
    const now = Date.now();
    const from = now - seconds * 1000;
    const done = recent.filter(d => d.end >= from);
    let due = 0, dropped = 0, sent = 0;
    for (const [sec, b] of dueBySecond) {
      if (sec * 1000 >= from) {
        due += b.due;
        dropped += b.dropped;
        sent += b.sent;
      }
    }
    return {done, due, dropped, sent, ...counts(done)};
  }

  function counts(done: Done[]) {
    let ok = 0, errors = 0, timeouts = 0, client = 0, hit = 0, miss = 0, noInfo = 0, bytes = 0;
    for (const d of done) {
      const k = kind(d);
      if (k === "ok") {
        ok++;
        bytes += d.bytes;
        if (d.hit === null) noInfo++;
        else if (d.hit) hit++;
        else miss++;
      }
      else if (k === "timeout") timeouts++;
      else if (k === "error") errors++;
      else client++;
    }
    const okDone = done.filter(d => kind(d) === "ok");
    const page = sortNum(okDone.map(d => d.ms));
    const ttfb = sortNum(okDone.map(d => d.ttfbMs ?? 0));
    return {
      finished: done.length, ok, errors, timeouts, client, hit, miss, noInfo, bytes,
      pageMs: {p50: quantile(page, 0.5), p95: quantile(page, 0.95), p99: quantile(page, 0.99), max: page.length ? page[page.length - 1] : null},
      ttfbMs: {p50: quantile(ttfb, 0.5), p95: quantile(ttfb, 0.95), p99: quantile(ttfb, 0.99)},
      // pages without a data-gen-cache attribute count as misses: the cache wasn't read for them
      hitShare: ok ? hit / ok : null
    };
  }

  function checkStops() {
    const s = cfg.stop;
    const w = windowStats(s.windowS);
    if (w.finished >= s.minRequests) {
      const errPct = 100 * (w.errors + w.timeouts) / w.finished;
      if (errPct > s.errorPct) return stopNow("errors", `${errPct.toFixed(1)}% errors or timeouts over the last ${s.windowS} s (${w.errors} errors, ${w.timeouts} timeouts of ${w.finished}); limit ${s.errorPct}%`);
      const missPct = w.ok ? 100 * (w.miss + w.noInfo) / w.ok : 0;
      if (w.ok >= s.minRequests && missPct > s.missPct) return stopNow("cache misses", `${missPct.toFixed(1)}% of pages were cache misses over the last ${s.windowS} s (${w.miss + w.noInfo} of ${w.ok}); limit ${s.missPct}%`);
    }
    if (w.due >= s.minRequests && 100 * w.dropped / w.due > s.droppedPct) {
      return stopNow("cap", `${(100 * w.dropped / w.due).toFixed(1)}% of requests due over the last ${s.windowS} s were dropped at the cap of ${cfg.cap} in flight; limit ${s.droppedPct}%`);
    }
    if (lastProbe && Date.now() - lastProbe.t < 15_000 && (!lastProbe.ok || lastProbe.ms > s.probeMs)) {
      return stopNow("tesseract", `the Tesseract probe ${lastProbe.ok ? `took ${Math.round(lastProbe.ms)} ms` : "failed"}; limit ${s.probeMs} ms`);
    }
    const mem = (monitor?.host as {availableMb?: number} | undefined)?.availableMb;
    if (typeof mem === "number" && mem < s.minMemMb) return stopNow("memory", `the site's host has ${mem} MB available; limit ${s.minMemMb} MB`);
  }

  // the Tesseract probe: one small query every `everyS` seconds, for a random place
  const prober = async () => {
    while (!stopReason && !finished) {
      const id = cfg.probe.placeIds.length ? cfg.probe.placeIds[Math.floor(Math.random() * cfg.probe.placeIds.length)] : "16000US3651000";
      const url = `${cfg.probe.tesseract.replace(/\/?$/, "/")}tesseract/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=Year&measures=Population&include=Place:${id}&locale=en`;
      const t = Date.now();
      const start = performance.now();
      let ok = false, status = 0;
      try {
        const res = await fetch(url, {signal: AbortSignal.timeout(30_000), headers: {"user-agent": "datausa-warm-ui-stress/1 (probe)"}});
        await res.text();
        status = res.status;
        ok = res.ok;
      }
      catch {
        ok = false;
      }
      lastProbe = {t, ms: performance.now() - start, ok};
      write("probe.jsonl", {t, ms: r1(lastProbe.ms), status, ok, place: id});
      if (acc[stageIndex]) acc[stageIndex].probes.push(lastProbe.ms);
      await sleep(cfg.probe.everyS * 1000);
    }
  };
  // the Monitor panel on the site's host, through its tunnel
  const monitorPoller = async () => {
    if (!cfg.monitorUrl) return;
    while (!stopReason && !finished) {
      try {
        const res = await fetch(`${cfg.monitorUrl.replace(/\/$/, "")}/api/monitor/latest`, {signal: AbortSignal.timeout(3000)});
        const body = await res.json() as Record<string, unknown>;
        monitor = body.latest ? body : null;
        if (monitorError) event({type: "monitor", message: "reachable again"});
        monitorError = body.latest ? null : "the monitor isn't sampling";
      }
      catch (e) {
        if (!monitorError) event({type: "monitor", message: `unreachable: ${(e as Error).message}`});
        monitorError = (e as Error).message;
        monitor = null;
      }
      await sleep(5000);
    }
  };

  function summary() {
    return {
      target, startedAt: new Date(startedAt).toISOString(), endedAt: finished || stopReason ? new Date().toISOString() : null,
      stoppedBy: stopReason ? {reason: stopReason, detail: stopDetail, stage: stopStage, label: cfg.stages[stopStage]?.label, t: stopT} : null,
      urls: urls.length, cap: cfg.cap, hitMargin: cfg.hitMargin, hitRule: cfg.hitRule ?? "total",
      stages: cfg.stages.map((st, i) => {
        const a = acc[i];
        if (a.startT === undefined) return {index: i, ...st, ran: false};
        const c = counts(a.finished);
        const secs = ((a.endT ?? Date.now()) - a.startT) / 1000;
        const probes = sortNum(a.probes);
        return {
          index: i, ...st, ran: true, startT: a.startT, endT: a.endT ?? null, actualSeconds: r1(secs),
          due: a.due, sent: a.sent, dropped: a.dropped, finished: c.finished,
          sentPerS: r1(a.sent / Math.max(1, secs)), servedPerS: r1(c.ok / Math.max(1, secs)),
          ok: c.ok, errors: c.errors, timeouts: c.timeouts, client: c.client,
          errorPct: c.finished ? r1(100 * (c.errors + c.timeouts) / c.finished) : null,
          hit: c.hit, miss: c.miss, noInfo: c.noInfo, hitPct: c.hitShare === null ? null : r1(100 * c.hitShare),
          pageMs: c.pageMs, ttfbMs: c.ttfbMs, mbPerS: r1(c.bytes / 1e6 / Math.max(1, secs)),
          probeMs: {count: probes.length, p50: r1(quantile(probes, 0.5)), max: r1(probes.length ? probes[probes.length - 1] : null)}
        };
      })
    };
  }
  const saveSummary = () => writeFileSync(join(OUT, "summary.json"), JSON.stringify(summary(), null, 1));

  // progress every 2 s, over the last 10 s
  const progress = setInterval(() => {
    const w = windowStats(10);
    const st = cfg.stages[stageIndex];
    const a = acc[stageIndex];
    const secs = Math.min(10, Math.max(0.001, (Date.now() - startedAt) / 1000));
    write("progress.jsonl", {
      t: Date.now(), stage: stageIndex, label: st?.label, rate: st?.rate ?? 0, stageElapsedS: a?.startT ? r1((Date.now() - a.startT) / 1000) : 0, stageSeconds: st?.seconds ?? 0,
      sentPerS: r1(w.sent / secs), servedPerS: r1(w.ok / secs), duePerS: r1(w.due / secs),
      pageMs: w.pageMs, ttfbMs: w.ttfbMs, errors: w.errors, timeouts: w.timeouts, client: w.client, dropped: w.dropped, inFlight,
      hit: w.hit, miss: w.miss, noInfo: w.noInfo, hitPct: w.hitShare === null ? null : r1(100 * w.hitShare), mbPerS: r1(w.bytes / 1e6 / secs),
      probeMs: lastProbe ? r1(lastProbe.ms) : null, probeOk: lastProbe?.ok ?? null,
      monitor: monitor ? {availableMb: (monitor.host as {availableMb?: number} | undefined)?.availableMb ?? null, ...(monitor.latest as object)} : monitorError ? {error: monitorError} : null
    });
    // forget what the windows no longer need
    const keepFrom = Date.now() - 120_000;
    recent = recent.filter(d => d.end >= keepFrom);
    for (const sec of dueBySecond.keys()) if (sec * 1000 < keepFrom) dueBySecond.delete(sec);
    if (!finished) checkStops();
  }, 2000);

  event({type: "start", target, urls: urls.length, stages: cfg.stages, cap: cfg.cap});
  void prober();
  void monitorPoller();

  for (stageIndex = 0; stageIndex < cfg.stages.length && !stopReason; stageIndex++) {
    const st = cfg.stages[stageIndex];
    const a = acc[stageIndex];
    a.startT = Date.now();
    event({type: "stage", index: stageIndex, label: st.label, rate: st.rate, seconds: st.seconds, startT: a.startT});
    const t0 = performance.now();
    const end = t0 + st.seconds * 1000;
    if (st.rate > 0) {
      // open model: request k starts at k / rate, whether or not the earlier ones finished
      const interval = 1000 / st.rate;
      let k = 0;
      while (!stopReason) {
        const now = performance.now();
        if (now >= end) break;
        const due = Math.min(Math.floor((now - t0) / interval) + 1, Math.ceil(st.seconds * st.rate));
        while (k < due && !stopReason) {
          launch(stageIndex);
          k++;
        }
        await sleep(Math.max(1, Math.min(20, t0 + k * interval - performance.now())));
      }
    }
    else {
      while (!stopReason && performance.now() < end) await sleep(200);
    }
    a.endT = Date.now();
    event({type: "stage end", index: stageIndex, label: st.label, endT: a.endT});
    saveSummary();
  }
  if (stageIndex >= cfg.stages.length) stageIndex = cfg.stages.length - 1;
  // let the last requests finish (or be aborted, on a stop)
  const drainUntil = Date.now() + (stopReason ? 2000 : cfg.timeoutMs);
  while (inFlight > 0 && Date.now() < drainUntil) await sleep(100);
  for (const c of controllers) c.abort(new Error("stopped"));
  finished = true;
  clearInterval(progress);
  saveSummary();
  event({type: "finished", stoppedBy: stopReason, inFlightLeft: inFlight});
  setTimeout(() => process.exit(0), 200);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(__filename)) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
