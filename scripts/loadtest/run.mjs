#!/usr/bin/env node
/**
 * Load test of a deployment: report pages that are not cached, at rising concurrency, while timing
 * Tesseract directly. Answers two questions: how many cold report pages a second the site serves,
 * and whether the Tesseract server slows down under the load the site sends it (which is capped at
 * UPSTREAM_MAX_CONCURRENCY × workers, src/lib/api/limit.ts).
 *
 *   node scripts/loadtest/run.mjs
 *   BASE=http://127.0.0.1:3054 STAGES=2,4,8,16 STAGE_SECONDS=120 node scripts/loadtest/run.mjs
 *
 * On a server without Node, with the node:24-alpine image the Dockerfile already pulled:
 *   docker run --rm --network host -v "$PWD":/w -w /w -e BASE=http://127.0.0.1:3054 node:24-alpine node scripts/loadtest/run.mjs
 *
 * Settings (environment):
 *   BASE           site origin (default http://127.0.0.1:3054, the sandbox container)
 *   AUTH           user:password for HTTP basic auth, to go through a protected Nginx
 *   STAGES         concurrent visitors per stage (default 2,4,8,16)
 *   STAGE_SECONDS  length of each stage (default 120)
 *   TESSERACT      Tesseract base URL for the probe (default https://api-penn.datausa.io/)
 *   SEED           shuffles the report list differently (default 1); change it between runs, since
 *                  pages from an earlier run with the same seed are cached in the site's workers
 *   OUT            JSON file for the results (default loadtest-<time>.json)
 *
 * Each visitor requests a report page and reads it to the end (the streamed report included), then
 * the next one. No URL is requested twice, so every page is built from scratch: the reports are
 * drawn from data/members.jsonl at random, which makes most of them places (as with crawlers).
 * Every 3 s a probe sends Tesseract one small query for a random place, directly, and times it.
 * With ENABLE_DEBUG_ROUTES=true on the site, /api/debug/upstream is polled for the slot counters
 * (each request reaches one worker, so the counters are sampled across workers).
 */
import {readFileSync, writeFileSync} from "node:fs";

const BASE = (process.env.BASE ?? "http://127.0.0.1:3054").replace(/\/$/, "");
const STAGES = (process.env.STAGES ?? "2,4,8,16").split(",").map(Number).filter(n => n > 0);
const STAGE_SECONDS = Number(process.env.STAGE_SECONDS ?? 120);
const TESSERACT = (process.env.TESSERACT ?? "https://api-penn.datausa.io/").replace(/\/?$/, "/");
const SEED = Number(process.env.SEED ?? 1);
const OUT = process.env.OUT ?? `loadtest-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
const PAGE_TIMEOUT_MS = 180_000;
const headers = process.env.AUTH ? {authorization: `Basic ${Buffer.from(process.env.AUTH).toString("base64")}`} : {};

const PROFILE = {Geography: "geo", CIP: "cip", NAPCS: "napcs", "PUMS Industry": "naics", "PUMS Occupation": "soc", University: "university"};

// mulberry32: a small seeded generator, so a run can be repeated
let state = SEED >>> 0;
const random = () => {
  state = (state + 0x6D2B79F5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = list => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

const members = readFileSync(new URL("../../data/members.jsonl", import.meta.url), "utf8")
  .split("\n").filter(Boolean).map(line => JSON.parse(line)).filter(m => PROFILE[m.dimension] && m.slug);
const reports = shuffle(members.map(m => ({path: `/profile/${PROFILE[m.dimension]}/${m.slug}`, profile: PROFILE[m.dimension]})));
const places = members.filter(m => m.hierarchy === "Place").map(m => m.id);
let nextReport = 0;

const quantile = (values, q) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
};
const seconds = ms => ms === null ? "-" : (ms / 1000).toFixed(1);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getPage(path) {
  const started = performance.now();
  try {
    const res = await fetch(BASE + path, {headers, redirect: "follow", signal: AbortSignal.timeout(PAGE_TIMEOUT_MS)});
    const body = await res.text();
    return {status: res.status, ms: performance.now() - started, bytes: body.length};
  }
  catch (error) {
    return {status: 0, ms: performance.now() - started, error: error.name === "TimeoutError" ? "timeout" : error.message};
  }
}

async function probeTesseract() {
  const id = places[Math.floor(random() * places.length)];
  const url = `${TESSERACT}tesseract/data.jsonrecords?cube=acs_yg_total_population_5&drilldowns=Year&measures=Population&include=Place:${id}&locale=en`;
  const started = performance.now();
  try {
    const res = await fetch(url, {signal: AbortSignal.timeout(30_000)});
    await res.text();
    return {ok: res.ok, ms: performance.now() - started};
  }
  catch {
    return {ok: false, ms: performance.now() - started};
  }
}

async function upstreamStats() {
  try {
    const res = await fetch(`${BASE}/api/debug/upstream`, {headers, signal: AbortSignal.timeout(5_000)});
    return res.ok ? await res.json() : null;
  }
  catch {
    return null;
  }
}

const tesseractHost = new URL(TESSERACT).host;
const counters = snapshot => snapshot.hosts?.[tesseractHost]?.sinceStart ?? {started: 0, shed: 0};

async function runStage(concurrency) {
  const pages = [], probes = [];
  let maxWaiting = 0, maxInFlight = 0;
  // each worker's first and latest counters in this stage, by pid
  const first = new Map(), latest = new Map();
  const end = Date.now() + STAGE_SECONDS * 1000;
  const stageStart = performance.now();

  const visitor = async () => {
    while (Date.now() < end && nextReport < reports.length) {
      const report = reports[nextReport++];
      pages.push({...report, ...await getPage(report.path)});
    }
  };
  const prober = async () => {
    while (Date.now() < end) {
      probes.push(await probeTesseract());
      await sleep(3_000);
    }
  };
  const poller = async () => {
    while (Date.now() < end) {
      const s = await upstreamStats();
      if (s) {
        if (!first.has(s.pid)) first.set(s.pid, s);
        latest.set(s.pid, s);
        const h = s.hosts?.[tesseractHost];
        if (h) { maxWaiting = Math.max(maxWaiting, h.waiting); maxInFlight = Math.max(maxInFlight, h.inFlight); }
      }
      await sleep(2_000);
    }
  };
  const progress = setInterval(() => {
    const ok = pages.filter(p => p.status === 200);
    process.stdout.write(`  ${concurrency} visitors: ${pages.length} pages, p50 ${seconds(quantile(ok.map(p => p.ms), 0.5))} s, tesseract probe p50 ${seconds(quantile(probes.map(p => p.ms), 0.5))} s\n`);
  }, 15_000);

  // the visitors finish the page they are on after the stage's end
  await Promise.all([...Array.from({length: concurrency}, visitor), prober(), poller()]);
  clearInterval(progress);
  const elapsed = (performance.now() - stageStart) / 1000;
  // requests sent and dropped by the workers seen, between their first and last sample
  let sent = 0, dropped = 0;
  for (const [pid, s] of latest) {
    sent += counters(s).started - counters(first.get(pid)).started;
    dropped += counters(s).shed - counters(first.get(pid)).shed;
  }
  const ok = pages.filter(p => p.status === 200);
  const byStatus = {};
  pages.forEach(p => { const k = p.error ?? p.status; byStatus[k] = (byStatus[k] ?? 0) + 1; });
  const okProbes = probes.filter(p => p.ok);
  return {
    concurrency,
    seconds: Number(elapsed.toFixed(1)),
    pages: pages.length,
    pagesPerSecond: Number((ok.length / elapsed).toFixed(2)),
    statuses: byStatus,
    pageMs: {p50: quantile(ok.map(p => p.ms), 0.5), p95: quantile(ok.map(p => p.ms), 0.95), max: quantile(ok.map(p => p.ms), 1)},
    pageMsByProfile: Object.fromEntries(Object.keys(PROFILE).map(d => PROFILE[d]).map(profile => {
      const list = ok.filter(p => p.profile === profile).map(p => p.ms);
      return [profile, {pages: list.length, p50: quantile(list, 0.5), p95: quantile(list, 0.95)}];
    }).filter(([, v]) => v.pages)),
    tesseractProbeMs: {count: probes.length, failed: probes.length - okProbes.length, p50: quantile(okProbes.map(p => p.ms), 0.5), p95: quantile(okProbes.map(p => p.ms), 0.95)},
    upstream: latest.size
      ? {workersSeen: latest.size, maxInFlight, maxWaiting, requestsSent: sent, dropped}
      : "unavailable (set ENABLE_DEBUG_ROUTES=true on the site)",
    slowest: [...ok].sort((a, b) => b.ms - a.ms).slice(0, 3).map(p => `${p.path} ${seconds(p.ms)} s`)
  };
}

console.log(`Load test of ${BASE}: stages ${STAGES.join(", ")} visitors × ${STAGE_SECONDS} s, ${reports.length} reports (seed ${SEED}), probing ${TESSERACT}`);
const baseline = [];
for (let i = 0; i < 5; i++) baseline.push((await probeTesseract()).ms);
console.log(`Tesseract probe at rest: p50 ${seconds(quantile(baseline, 0.5))} s\n`);
const s0 = await upstreamStats();
if (s0) console.log(`Slots: ${s0.maxInFlight} per worker per host, dropped after ${s0.queueTimeoutMs} ms\n`);

const results = [];
for (const concurrency of STAGES) {
  console.log(`Stage: ${concurrency} visitors`);
  const r = await runStage(concurrency);
  results.push(r);
  console.log(`  => ${r.pages} pages, ${r.pagesPerSecond}/s, page p50 ${seconds(r.pageMs.p50)} s p95 ${seconds(r.pageMs.p95)} s, statuses ${JSON.stringify(r.statuses)}`);
  console.log(`     tesseract probe p50 ${seconds(r.tesseractProbeMs.p50)} s p95 ${seconds(r.tesseractProbeMs.p95)} s (${r.tesseractProbeMs.failed} failed)`);
  console.log(`     upstream ${JSON.stringify(r.upstream)}\n`);
}

console.log("visitors  pages/s  page p50  page p95  probe p50  probe p95  in flight  waiting  dropped");
for (const r of results) {
  const u = typeof r.upstream === "object" ? r.upstream : {};
  console.log([String(r.concurrency).padStart(8), String(r.pagesPerSecond).padStart(8), seconds(r.pageMs.p50).padStart(9), seconds(r.pageMs.p95).padStart(9), seconds(r.tesseractProbeMs.p50).padStart(10), seconds(r.tesseractProbeMs.p95).padStart(10), String(u.maxInFlight ?? "-").padStart(10), String(u.maxWaiting ?? "-").padStart(8), String(u.dropped ?? "-").padStart(8)].join(" "));
}
writeFileSync(OUT, JSON.stringify({base: BASE, seed: SEED, stageSeconds: STAGE_SECONDS, tesseract: TESSERACT, baselineProbeMs: quantile(baseline, 0.5), results}, null, 2));
console.log(`\nResults written to ${OUT}`);
