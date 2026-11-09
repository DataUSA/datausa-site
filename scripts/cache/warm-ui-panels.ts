// The Stress and Monitor parts of the warm UI's page (scripts/cache/warm-ui.ts splices them in).
// Plain strings: the page has no build step. Times on the page are UTC, like the files.

export const PANELS_CSS = /* css */ `
[hidden]{display:none !important}
.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}
.chart{border:1px solid var(--line);border-radius:5px;padding:6px 8px 4px;min-width:0}
.chart .head{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted)}
.chart .head b{color:var(--fg);font-variant-numeric:tabular-nums}
.chart svg{display:block;width:100%;height:70px}
.chart .axis{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px 20px}
.field{display:flex;gap:8px;align-items:center;justify-content:space-between}
.field input[type=text]{width:min(100%,280px)}
.legend{display:inline-block;width:10px;height:3px;vertical-align:middle;margin-right:4px}
.ok{color:var(--accent)}
fieldset{border:1px solid var(--line);border-radius:5px;padding:8px 12px;margin:0;min-width:0}legend{color:var(--muted);font-size:12px;padding:0 4px}
`;

export const STRESS_PANEL = /* html */ `
  <div data-panel="stress" hidden>
    <p class="help">Cached report pages at fixed arrival rates (requests start on schedule whether or not earlier ones finished), each read to the end, with a Tesseract probe every 10 s. Run it from a machine other than the site's. It stops by itself when a stop condition is met. Watch the Redis monitor on the site's host next to it.</p>
    <div class="grid2">
      <label class="field">Target site <input type="text" id="stTarget" autocomplete="off"></label>
      <label class="field">Tesseract probe <input type="text" id="stTesseract" autocomplete="off"></label>
      <label class="field">Monitor UI, optional <input type="text" id="stMonitor" placeholder="http://localhost:5561" autocomplete="off"></label>
    </div>
    <fieldset><legend>Stages</legend>
      <div class="row tabs" role="radiogroup" aria-label="Stages">
        <label><input type="radio" name="stKind" value="stages" checked> Rising rates</label>
        <label><input type="radio" name="stKind" value="spike"> Spike</label>
      </div>
      <div class="row" id="stStages" style="margin-top:8px">
        <label class="row" style="gap:6px">Pages/s <input type="text" id="stRates" style="width:220px" autocomplete="off"></label>
        <label class="row" style="gap:6px">Seconds each <input type="number" min="1" id="stSeconds"></label>
        <label class="row" style="gap:6px">Pause between, s <input type="number" min="0" id="stPause"></label>
      </div>
      <div class="row" id="stSpike" style="margin-top:8px" hidden>
        <label class="row" style="gap:6px">Base pages/s <input type="number" min="0.1" step="any" id="stBase"></label>
        <label class="row" style="gap:6px">for s <input type="number" min="0" id="stBefore"></label>
        <label class="row" style="gap:6px">Peak pages/s <input type="number" min="0.1" step="any" id="stPeak"></label>
        <label class="row" style="gap:6px">for s <input type="number" min="1" id="stPeakS"></label>
        <label class="row" style="gap:6px">then base for s <input type="number" min="0" id="stAfter"></label>
      </div>
      <div class="muted" id="stStageInfo" style="margin-top:6px"></div>
    </fieldset>
    <fieldset><legend>Load and stop conditions</legend>
      <div class="row">
        <label class="row" style="gap:6px">Cap in flight <input type="number" min="1" id="stCap"></label>
        <label class="row" style="gap:6px">Page timeout, s <input type="number" min="1" id="stTimeout"></label>
        <label class="row" style="gap:6px">A page is a cache hit when its hits are within <input type="number" min="0" id="stMargin"> of <select id="stRule"><option value="total">its total</option><option value="best">the URL's best in this run (and above 0)</option></select></label>
      </div>
      <div class="row" style="margin-top:6px">
        <span class="muted">Stop when, over the last <input type="number" min="5" id="stWindow"> s:</span>
        <label class="row" style="gap:6px">errors &gt; <input type="number" min="0" step="any" id="stErr"> %</label>
        <label class="row" style="gap:6px">cache misses &gt; <input type="number" min="0" step="any" id="stMiss"> %</label>
        <label class="row" style="gap:6px">dropped at the cap &gt; <input type="number" min="0" step="any" id="stDrop"> %</label>
        <label class="row" style="gap:6px">a probe &gt; <input type="number" min="100" id="stProbe"> ms</label>
        <label class="row" style="gap:6px">host memory &lt; <input type="number" min="0" id="stMem"> MB (needs the monitor)</label>
      </div>
    </fieldset>
    <fieldset><legend>URL list (warmed levels only; school districts aren't cached)</legend>
      <div class="row">
        <label class="row" style="gap:6px">URLs <input type="number" min="10" id="stSize"></label>
        <label class="row" style="gap:6px">Popularity skew <input type="number" min="0" max="3" step="0.1" id="stSkew"></label>
        <label class="row" style="gap:6px">Seed <input type="number" min="1" id="stSeed"></label>
        <button id="stPreview">Preview the list</button><span class="muted" id="stPreviewInfo"></span>
      </div>
      <p class="help">Each level gets its share of the list; within a level, members are drawn by size rank with weight 1/rank<sup>skew</sup>, so states, big cities and large universities repeat. "Largest only" limits a level to its N largest members (empty: all), for example to the ones a partial warm covered.</p>
      <div class="scroll"><table><thead><tr><th>Profile</th><th>Level</th><th class="n">Members</th><th class="n">Share %</th><th class="n">Largest only</th><th class="n">URLs</th><th class="n">Distinct</th></tr></thead><tbody id="stLevels"></tbody></table></div>
    </fieldset>
  </div>
`;

export const STRESS_CARD = /* html */ `
<section class="card" id="stressCard" hidden>
  <div class="row" style="justify-content:space-between"><div class="row"><h2 id="sTitle"></h2><span class="pill" id="sState"></span></div>
    <div class="row"><button class="danger" id="sStop" hidden>Stop now</button></div></div>
  <div class="muted" id="sWhat"></div>
  <div id="sStopped"></div>
  <div class="bar"><div id="sBar" style="width:0"></div></div>
  <div class="muted" id="sLine"></div>
  <div class="kpis" id="sKpis"></div>
  <div class="charts" id="sCharts"></div>
  <div class="scroll"><table><thead><tr><th>Stage</th><th class="n">Rate</th><th class="n">Sent/s</th><th class="n">Served/s</th><th class="n">p50</th><th class="n">p95</th><th class="n">p99</th><th class="n">TTFB p95</th><th class="n">Hits</th><th class="n">Errors</th><th class="n">Timeouts</th><th class="n">Dropped</th><th class="n">MB/s</th><th class="n">Probe max</th></tr></thead><tbody id="sStages"></tbody></table></div>
  <details><summary>Events</summary><pre id="sEvents"></pre></details>
  <details><summary>Output</summary><pre id="sOutput"></pre></details>
</section>
`;

export const MONITOR_CARD = /* html */ `
<section class="card" id="monCard" hidden>
  <div class="row" style="justify-content:space-between"><div class="row"><h2>Redis monitor</h2><span class="pill idle" id="mState"></span></div>
    <div class="row" id="mControls">
      <label class="row" style="gap:6px">Every <input type="number" min="250" step="250" id="mInterval" value="1000"> ms</label>
      <label class="row" style="gap:6px">MGET of <input type="number" min="1" max="1000" id="mKeys" value="100"> keys</label>
      <label class="row" style="gap:6px">Show <select id="mMinutes"><option value="5">5 min</option><option value="15" selected>15 min</option><option value="60">1 h</option><option value="240">4 h</option></select></label>
      <button class="primary" id="mStart">Start sampling</button><button class="danger" id="mStop" hidden>Stop sampling</button>
    </div></div>
  <p class="help">Read-only: every second it times a PING and an MGET of a fixed sample of real <code>gen:*</code> keys and reads INFO (only INFO, PING, MGET and SCAN are ever sent). Samples are saved to the run's <code>samples.jsonl</code>, with times in ms since the epoch (UTC), to line up with a stress run's files.</p>
  <div class="muted" id="mLine"></div><span class="err" id="mMsg"></span>
  <div class="kpis" id="mKpis"></div>
  <div class="charts" id="mCharts"></div>
</section>
`;

export const PANELS_JS = /* js */ `
const utc = t => new Date(t).toISOString().slice(11, 19);
const num = (v, d = 0) => v == null || Number.isNaN(v) ? "–" : Number(v).toLocaleString("en-US", {maximumFractionDigits: d, minimumFractionDigits: 0});
const msTxt = v => v == null ? "–" : v >= 1000 ? (v / 1000).toFixed(2) + " s" : v >= 10 ? Math.round(v) + " ms" : v.toFixed(2) + " ms";
const COLORS = ["var(--accent)", "var(--warn)", "var(--bad)", "var(--muted)"];

/** A small line chart: one or more series of the same points, optional vertical marks (stage starts). */
function chart(title, pts, series, opts = {}) {
  const W = 300, H = 70;
  const xs = pts.map(p => p.t);
  const t0 = xs[0], t1 = xs[xs.length - 1];
  let max = opts.max ?? 0;
  for (const s of series) for (const p of pts) { const v = p[s.key]; if (typeof v === "number" && v > max) max = v; }
  if (opts.limit != null && opts.limit > max) max = opts.limit;
  if (!max) max = 1;
  const X = t => t1 > t0 ? (t - t0) / (t1 - t0) * W : 0;
  const Y = v => H - 2 - (v / max) * (H - 6);
  const lines = series.map((s, i) => {
    let d = "", pen = false;
    for (const p of pts) {
      const v = p[s.key];
      if (typeof v !== "number") { pen = false; continue; }
      d += (pen ? "L" : "M") + X(p.t).toFixed(1) + " " + Y(v).toFixed(1);
      pen = true;
    }
    return '<path d="' + d + '" fill="none" stroke="' + (s.color || COLORS[i]) + '" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
  }).join("");
  const marks = (opts.marks || []).filter(m => m >= t0 && m <= t1).map(m => '<line x1="' + X(m).toFixed(1) + '" x2="' + X(m).toFixed(1) + '" y1="0" y2="' + H + '" stroke="var(--line)" stroke-dasharray="2 2" vector-effect="non-scaling-stroke"/>').join("");
  const limit = opts.limit != null ? '<line x1="0" x2="' + W + '" y1="' + Y(opts.limit).toFixed(1) + '" y2="' + Y(opts.limit).toFixed(1) + '" stroke="var(--bad)" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>' : "";
  const lastVal = s => { for (let i = pts.length - 1; i >= 0; i--) if (typeof pts[i][s.key] === "number") return pts[i][s.key]; return null; };
  const fmt = opts.fmt || (v => num(v, 1));
  const now = series.map((s, i) => (series.length > 1 ? '<span class="legend" style="background:' + (s.color || COLORS[i]) + '"></span>' + esc(s.label) + " " : "") + "<b>" + fmt(lastVal(s)) + "</b>").join(" ");
  return '<div class="chart"><div class="head"><span>' + esc(title) + '</span><span>' + now + '</span></div>' +
    '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(title) + '">' + marks + limit + lines + '</svg>' +
    '<div class="axis"><span>' + (pts.length ? utc(t0) : "") + '</span><span>max ' + fmt(max) + '</span><span>' + (pts.length ? utc(t1) + " UTC" : "") + '</span></div></div>';
}

// ---------------- Stress ----------------
let stressInit = false;
function stressDefaults() {
  const d = info.stress;
  if (!d || stressInit) return;
  stressInit = true;
  $("stTarget").value = d.target; $("stTesseract").value = d.tesseract; $("stMonitor").value = d.monitorUrl || "";
  const si = d.stageInput;
  $("stRates").value = si.rates; $("stSeconds").value = si.seconds; $("stPause").value = si.pauseS;
  $("stBase").value = si.base; $("stBefore").value = si.beforeS; $("stPeak").value = si.peak; $("stPeakS").value = si.peakS; $("stAfter").value = si.afterS;
  $("stCap").value = d.cap; $("stTimeout").value = d.timeoutMs / 1000; $("stMargin").value = d.hitMargin; $("stRule").value = d.hitRule || "total";
  $("stWindow").value = d.stop.windowS; $("stErr").value = d.stop.errorPct; $("stMiss").value = d.stop.missPct; $("stDrop").value = d.stop.droppedPct; $("stProbe").value = d.stop.probeMs; $("stMem").value = d.stop.minMemMb;
  $("stSize").value = d.mix.size; $("stSkew").value = d.mix.skew; $("stSeed").value = d.mix.seed;
  $("stLevels").innerHTML = info.levels.map(l => {
    const m = d.mix.levels[l.key] || {share: 0, pool: 0};
    return '<tr><td>' + esc(l.profile) + '</td><td>' + esc(l.hierarchy) + '</td><td class="n">' + fmtN(l.members) + '</td>' +
      '<td class="n"><input type="number" min="0" step="any" data-mix="' + esc(l.key) + '" data-f="share" value="' + m.share + '" aria-label="share of ' + esc(label(l.key)) + '"></td>' +
      '<td class="n"><input type="number" min="0" data-mix="' + esc(l.key) + '" data-f="pool" value="' + (m.pool || "") + '" aria-label="largest members of ' + esc(label(l.key)) + '"></td>' +
      '<td class="n" data-out="' + esc(l.key) + '"></td><td class="n" data-dist="' + esc(l.key) + '"></td></tr>';
  }).join("");
  stageInfo();
}
function stageInput() {
  const kind = document.querySelector('input[name="stKind"]:checked').value;
  return {kind, rates: $("stRates").value, seconds: Number($("stSeconds").value), pauseS: Number($("stPause").value),
    base: Number($("stBase").value), beforeS: Number($("stBefore").value), peak: Number($("stPeak").value), peakS: Number($("stPeakS").value), afterS: Number($("stAfter").value)};
}
function stagesOf(s) {
  if (s.kind === "spike") return [[s.base, s.beforeS], [s.peak, s.peakS], [s.base, s.afterS]].filter(x => x[1] > 0).map(([rate, seconds]) => ({rate, seconds}));
  const rates = s.rates.split(/[^0-9.]+/).map(Number).filter(n => n > 0);
  const out = [];
  rates.forEach((rate, i) => { out.push({rate, seconds: s.seconds}); if (s.pauseS > 0 && i < rates.length - 1) out.push({rate: 0, seconds: s.pauseS}); });
  return out;
}
function stageInfo() {
  const st = stagesOf(stageInput());
  const secs = st.reduce((n, s) => n + s.seconds, 0), pages = st.reduce((n, s) => n + s.rate * s.seconds, 0);
  $("stStageInfo").textContent = st.length ? st.filter(s => s.rate).length + " stages, " + fmtS(secs) + " in all, about " + fmtN(Math.round(pages)) + " pages" : "No stages";
  $("stStages").hidden = stageInput().kind !== "stages"; $("stSpike").hidden = stageInput().kind !== "spike";
}
function stressMix() {
  const levels = {};
  document.querySelectorAll("[data-mix]").forEach(i => { const k = i.dataset.mix; levels[k] ??= {share: 0, pool: 0}; levels[k][i.dataset.f] = Number(i.value) || 0; });
  return {levels, size: Number($("stSize").value), skew: Number($("stSkew").value), seed: Number($("stSeed").value)};
}
function stressBody() {
  return {
    target: $("stTarget").value.trim(), tesseract: $("stTesseract").value.trim(), monitorUrl: $("stMonitor").value.trim(),
    stageInput: stageInput(), mix: stressMix(), cap: Number($("stCap").value), timeoutMs: 1000 * Number($("stTimeout").value), hitMargin: Number($("stMargin").value), hitRule: $("stRule").value,
    stop: {windowS: Number($("stWindow").value), minRequests: info.stress.stop.minRequests, errorPct: Number($("stErr").value), missPct: Number($("stMiss").value), droppedPct: Number($("stDrop").value), probeMs: Number($("stProbe").value), minMemMb: Number($("stMem").value)}
  };
}
document.addEventListener("input", e => { if (e.target.closest && e.target.closest('[data-panel="stress"]')) { stageInfo(); updatePlanInfo(); } });
document.addEventListener("change", e => { if (e.target.name === "stKind") stageInfo(); });
document.addEventListener("click", async e => {
  if (e.target.id !== "stPreview") return;
  $("stPreviewInfo").textContent = "Building…";
  const r = await api("/api/stress/urls", {mix: stressMix()});
  if (r.error) { $("stPreviewInfo").textContent = r.error; return; }
  document.querySelectorAll("[data-out]").forEach(td => { const b = r.byLevel[td.dataset.out]; td.textContent = b ? fmtN(b.urls) : ""; });
  document.querySelectorAll("[data-dist]").forEach(td => { const b = r.byLevel[td.dataset.dist]; td.textContent = b ? fmtN(b.distinct) : ""; });
  $("stPreviewInfo").textContent = fmtN(r.urls) + " URLs, " + fmtN(r.distinct) + " distinct reports. First: " + r.sample.slice(0, 5).join(", ");
});

function renderStress(s) {
  $("stressCard").hidden = false;
  const m = s.meta, x = s.stress, c = x.config || {}, l = x.latest || {}, sum = x.summary;
  $("sTitle").textContent = "Stress run " + m.id.replace("T", " ");
  const cls = {running: "", stopping: "warn", finished: "", stopped: "warn", failed: "bad", interrupted: "bad"}[s.state] ?? "idle";
  $("sState").className = "pill " + cls; $("sState").textContent = s.state;
  $("sWhat").textContent = (c.target || "") + " · " + fmtN(m.reports) + " URLs · cap " + c.cap + " in flight" + (c.monitorUrl ? " · monitor " + c.monitorUrl : "");
  $("sStop").hidden = s.state !== "running"; $("sStop").disabled = false;
  const stop = sum && sum.stoppedBy;
  $("sStopped").innerHTML = stop ? '<span class="pill ' + (stop.reason === "user" ? "warn" : "bad") + '">stopped: ' + esc(stop.reason) + '</span> <span>' + esc(stop.detail) + ' (stage ' + esc(stop.label || "") + ')</span>' : "";
  const stages = c.stages || [];
  const total = stages.reduce((n, st) => n + st.seconds, 0);
  const before = stages.slice(0, l.stage || 0).reduce((n, st) => n + st.seconds, 0);
  const elapsed = s.state === "finished" ? total : before + (l.stageElapsedS || 0);
  $("sBar").style.width = (100 * Math.min(1, elapsed / Math.max(1, total))).toFixed(1) + "%";
  $("sLine").textContent = l.t ? "Stage " + ((l.stage || 0) + 1) + " of " + stages.length + ": " + (l.label || "") + " · " + fmtS(l.stageElapsedS) + " of " + fmtS(l.stageSeconds) + " · " + fmtS(elapsed) + " of " + fmtS(total) + " · last update " + utc(l.t) + " UTC" : "Waiting for the first progress line…";
  const mon = l.monitor;
  $("sKpis").innerHTML = l.t ? [
    kpi(num(l.sentPerS, 1) + " → " + num(l.servedPerS, 1), "Pages/s sent → served (10 s)"),
    kpi(msTxt(l.pageMs && l.pageMs.p50) + " · " + msTxt(l.pageMs && l.pageMs.p95) + " · " + msTxt(l.pageMs && l.pageMs.p99), "Page p50 · p95 · p99"),
    kpi(msTxt(l.ttfbMs && l.ttfbMs.p50) + " · " + msTxt(l.ttfbMs && l.ttfbMs.p95), "First byte p50 · p95"),
    kpi('<span class="' + (l.hitPct != null && l.hitPct < 95 ? "err" : "") + '">' + (l.hitPct == null ? "–" : num(l.hitPct, 1) + "%") + "</span>", "Cache hits (" + fmtN(l.miss) + " miss, " + fmtN(l.noInfo) + " no attribute)"),
    kpi('<span class="' + (l.errors || l.timeouts ? "err" : "") + '">' + fmtN(l.errors) + " · " + fmtN(l.timeouts) + "</span>", "Errors · timeouts (10 s)"),
    kpi(fmtN(l.inFlight) + " / " + fmtN(c.cap), "In flight / cap (" + fmtN(l.dropped) + " dropped)"),
    kpi('<span class="' + (l.probeOk === false || l.probeMs > (c.stop ? c.stop.probeMs : 5000) ? "err" : "") + '">' + msTxt(l.probeMs) + "</span>", "Tesseract probe"),
    kpi(num(l.mbPerS, 1) + " MB/s", "Received"),
    ...(mon ? [mon.error ? kpi('<span class="err">–</span>', "Monitor: " + esc(mon.error)) : kpi(num(mon.availableMb) + " MB · " + msTxt(mon.mgetMs && mon.mgetMs.p95), "Host memory · Redis MGET p95")] : [])
  ].join("") : "";
  const pts = x.series.map(p => ({t: p.t, sent: p.sentPerS, served: p.servedPerS, p50: p.pageMs && p.pageMs.p50, p95: p.pageMs && p.pageMs.p95, p99: p.pageMs && p.pageMs.p99, ttfb: p.ttfbMs && p.ttfbMs.p95, hit: p.hitPct, err: (p.errors || 0) + (p.timeouts || 0), inflight: p.inFlight, probe: p.probeMs, mem: p.monitor && p.monitor.availableMb, mget: p.monitor && p.monitor.mgetMs && p.monitor.mgetMs.p95}));
  const marks = (x.events || []).filter(e => e.type === "stage").map(e => e.startT);
  const o = {marks};
  $("sCharts").innerHTML = pts.length ? [
    chart("Pages/s", pts, [{key: "sent", label: "sent"}, {key: "served", label: "served"}], o),
    chart("Page time", pts, [{key: "p50", label: "p50"}, {key: "p95", label: "p95"}, {key: "p99", label: "p99"}], {...o, fmt: msTxt}),
    chart("First byte p95", pts, [{key: "ttfb", label: "p95"}], {...o, fmt: msTxt}),
    chart("Cache hits %", pts, [{key: "hit", label: "hits"}], {...o, max: 100, limit: c.stop ? 100 - c.stop.missPct : null, fmt: v => num(v, 1) + "%"}),
    chart("Errors + timeouts (10 s)", pts, [{key: "err", label: "errors"}], {...o, fmt: v => num(v)}),
    chart("In flight", pts, [{key: "inflight", label: "in flight"}], {...o, fmt: v => num(v)}),
    chart("Tesseract probe", pts, [{key: "probe", label: "probe"}], {...o, limit: c.stop ? c.stop.probeMs : null, fmt: msTxt}),
    ...(pts.some(p => p.mem != null) ? [chart("Host memory available (monitor)", pts, [{key: "mem", label: "MB"}], {...o, limit: c.stop ? c.stop.minMemMb : null, fmt: v => num(v) + " MB"}), chart("Redis MGET p95 (monitor)", pts, [{key: "mget", label: "p95"}], {...o, fmt: msTxt})] : [])
  ].join("") : "";
  $("sStages").innerHTML = (sum ? sum.stages : []).filter(st => st.ran && st.rate > 0).map(st =>
    '<tr><td>' + esc(st.label) + '</td><td class="n">' + num(st.rate, 1) + '</td><td class="n">' + num(st.sentPerS, 1) + '</td><td class="n">' + num(st.servedPerS, 1) + '</td>' +
    '<td class="n">' + msTxt(st.pageMs.p50) + '</td><td class="n">' + msTxt(st.pageMs.p95) + '</td><td class="n">' + msTxt(st.pageMs.p99) + '</td><td class="n">' + msTxt(st.ttfbMs.p95) + '</td>' +
    '<td class="n">' + (st.hitPct == null ? "–" : num(st.hitPct, 1) + "%") + '</td><td class="n' + (st.errors ? " err" : "") + '">' + fmtN(st.errors) + '</td><td class="n' + (st.timeouts ? " err" : "") + '">' + fmtN(st.timeouts) + '</td><td class="n">' + fmtN(st.dropped) + '</td>' +
    '<td class="n">' + num(st.mbPerS, 1) + '</td><td class="n">' + msTxt(st.probeMs.max) + '</td></tr>').join("") || '<tr><td colspan="14" class="muted">No stage finished yet</td></tr>';
  $("sEvents").textContent = (x.events || []).map(e => { const {t, ...rest} = e; return utc(t) + "  " + JSON.stringify(rest); }).join(String.fromCharCode(10)) || "No events yet";
  $("sOutput").textContent = s.output || "No output";
}
document.addEventListener("click", async e => {
  if (e.target.id !== "sStop") return;
  e.target.disabled = true;
  await api("/api/stop", {});
  await refresh();
});

// ---------------- Monitor ----------------
let monViewing = null;
async function renderMonitor() {
  if (!info.monitor) { $("monCard").hidden = true; return; }
  $("monCard").hidden = false;
  const minutes = $("mMinutes").value;
  const id = monViewing || info.monitor.current || "";
  const m = await api("/api/monitor?minutes=" + minutes + (id ? "&id=" + encodeURIComponent(id) : ""));
  const running = Boolean(info.monitor.current);
  $("mStart").hidden = running; $("mStop").hidden = !running; $("mStart").disabled = false; $("mStop").disabled = false;
  const viewingOld = m.id && m.id !== info.monitor.current;
  $("mState").className = "pill " + (running && !viewingOld ? "" : "idle");
  $("mState").textContent = running && !viewingOld ? "sampling" : m.id ? "stopped" : "not sampling";
  const L = m.latest;
  $("mLine").innerHTML = (m.id ? "Run " + esc(m.id) + (viewingOld ? ' (an earlier run; <a id="mBack">back to the current one</a>)' : "") + " · " + fmtN(m.samples) + " samples · " + esc(m.file) : "Not sampling. Start it to record " + esc(info.monitor.redis) + ".") +
    (L ? " · Redis " + esc(L.redisVersion || "") + ", " + fmtN(L.keys) + " keys · last sample " + utc(L.t) + " UTC" + (L.ageS > 10 && running ? ' <span class="err">(' + L.ageS + " s ago)</span>" : "") : "");
  if ($("mBack")) $("mBack").onclick = () => { monViewing = null; renderMonitor(); };
  if (!L) { $("mKpis").innerHTML = ""; $("mCharts").innerHTML = ""; return; }
  const q = s => msTxt(s.p50) + " · " + msTxt(s.p95) + " · " + msTxt(s.max);
  const hitRate = L.hitsPerS != null && (L.hitsPerS + L.missesPerS) > 0 ? " (" + num(100 * L.hitsPerS / (L.hitsPerS + L.missesPerS), 1) + "% hits)" : "";
  $("mKpis").innerHTML = [
    kpi(num(L.opsPerS), "Ops/s"),
    kpi(num(L.cpuUserPct, 1) + "% · " + num(L.cpuSysPct, 1) + "%", "CPU user · sys (of a core)" + (L.cpuMainPct != null ? ", main thread " + num(L.cpuMainPct, 1) + "%" : "")),
    kpi(q(L.mgetMs), "MGET of " + fmtN(m.keys) + " keys, 1 min p50 · p95 · max" + (L.mgetNulls ? " (" + L.mgetNulls + " gone)" : "")),
    kpi(q(L.pingMs), "PING, 1 min p50 · p95 · max"),
    kpi(fmtN(L.connectedClients) + " · " + fmtN(L.blockedClients), "Clients connected · blocked"),
    kpi(fmtB(L.usedMemory || 0) + (L.maxmemory ? " / " + fmtB(L.maxmemory) : ""), "Used memory, fragmentation " + num(L.fragmentation, 2)),
    kpi(num(L.hitsPerS) + " · " + num(L.missesPerS), "Keyspace hits · misses /s" + hitRate),
    kpi('<span class="' + (L.evictedPerS ? "err" : "") + '">' + fmtN(L.evictedKeys) + '</span> · <span class="' + (L.rejectedConnections ? "err" : "") + '">' + fmtN(L.rejectedConnections) + "</span>", "Evicted keys · rejected connections"),
    kpi('<span class="' + (L.bgsaveInProgress || L.aofRewriteInProgress ? "err" : "") + '">' + (L.bgsaveInProgress ? "snapshot" : L.aofRewriteInProgress ? "AOF rewrite" : "idle") + "</span>", "Persistence · last fork " + num((L.latestForkUsec || 0) / 1000, 1) + " ms · delayed fsyncs " + fmtN(L.aofDelayedFsync)),
    kpi(num(L.netOutMBps, 1) + " MB/s", "Network out"),
    kpi(L.host ? num(L.host.availableMb) + " MB" : "–", L.host ? "Host memory available of " + num(L.host.totalMb) + " MB · load " + num(L.load1, 2) : "Host memory (Linux only)"),
    ...(L.errorsLastMinute ? [kpi('<span class="err">' + L.errorsLastMinute + "</span>", "Failed samples, last minute: " + esc(L.lastError || ""))] : [])
  ].join("");
  const p = m.series;
  $("mCharts").innerHTML = [
    chart("Ops/s", p, [{key: "opsPerS", label: "ops/s"}], {fmt: v => num(v)}),
    chart("CPU % of a core", p, [{key: "cpuUserPct", label: "user"}, {key: "cpuSysPct", label: "sys"}], {fmt: v => num(v, 1)}),
    chart("MGET of " + m.keys + " keys", p, [{key: "mgetMs", label: "worst"}], {fmt: msTxt}),
    chart("PING", p, [{key: "pingMs", label: "worst"}], {fmt: msTxt}),
    chart("Clients", p, [{key: "clients", label: "connected"}], {fmt: v => num(v)}),
    chart("Network out", p, [{key: "netOutMBps", label: "MB/s"}], {fmt: v => num(v, 1) + " MB/s"}),
    chart("Used memory", p, [{key: "usedMemory", label: "used"}], {fmt: v => fmtB(v || 0)}),
    chart("Host memory available", p, [{key: "availableMb", label: "MB"}], {limit: 2048, fmt: v => num(v) + " MB"}),
    chart("Snapshot or AOF rewrite running", p, [{key: "persisting", label: "running"}], {max: 1, fmt: v => v ? "yes" : "no"}),
    chart("Evicted keys/s", p, [{key: "evictedPerS", label: "evicted"}], {fmt: v => num(v, 1)})
  ].join("");
}
$("mStart").addEventListener("click", async () => {
  $("mStart").disabled = true; $("mMsg").textContent = "";
  const r = await api("/api/monitor/start", {interval: Number($("mInterval").value), keys: Number($("mKeys").value)});
  if (r.error) $("mMsg").textContent = r.error;
  monViewing = null;
  await refresh();
});
$("mStop").addEventListener("click", async () => {
  $("mStop").disabled = true;
  const r = await api("/api/monitor/stop", {});
  if (r.error) $("mMsg").textContent = r.error;
  await refresh();
});
$("mMinutes").addEventListener("change", () => renderMonitor());
`;
