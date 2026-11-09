// The Stress and Monitor parts of the warm UI's page (scripts/cache/warm-ui.ts splices them in).
// Plain strings: the page has no build step. Times on the page are UTC, like the files.

export const PANELS_CSS = /* css */ `
[hidden]{display:none !important}
.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}
.chart{border:1px solid var(--line);border-radius:5px;padding:6px 8px 4px;min-width:0}
.chart .head{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--muted)}
.chart .head b{color:var(--fg);font-variant-numeric:tabular-nums}
.chart.wide{grid-column:1/-1}
.chart .plot{position:relative;margin-top:4px}
.chart svg{display:block;width:100%;height:100%;overflow:visible}
.chart .yl{position:absolute;left:0;transform:translateY(-50%);font-size:10px;line-height:1.2;color:var(--muted);background:var(--panel);padding:0 3px 0 0;font-variant-numeric:tabular-nums;pointer-events:none}
.chart .rl{position:absolute;right:0;transform:translateY(-100%);font-size:10px;line-height:1.2;font-weight:600;background:var(--panel);padding:0 0 0 3px;pointer-events:none}
.chart .axis{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);font-variant-numeric:tabular-nums;margin-top:2px}
.sec{display:grid;gap:10px}
.sec h3{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:6px 0 0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.tile{border:1px solid var(--line);border-left:4px solid var(--line);border-radius:5px;padding:8px 10px;display:grid;gap:1px;align-content:start;min-width:0}
.tile b{font-size:1.5rem;line-height:1.25;font-variant-numeric:tabular-nums}
.tile .lbl{font-size:13px}
.tile .sub{font-size:12px;color:var(--muted)}
.tiles.compact b{font-size:1.05rem}
.tile.ok{border-left-color:var(--accent);color:var(--fg)}
.tile.warn{border-left-color:var(--warn);background:var(--warn-soft)}
.tile.warn b{color:var(--warn)}
.tile.bad{border-left-color:var(--bad);background:var(--bad-soft)}
.tile.bad b{color:var(--bad)}
.banner{padding:10px 14px;border-radius:6px;font-weight:600;border:1px solid var(--line)}
.banner.ok{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.banner.warn{background:var(--warn-soft);color:var(--warn);border-color:var(--warn)}
.banner.bad{background:var(--bad-soft);color:var(--bad);border-color:var(--bad)}
.banner span{font-weight:400}
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
  <div class="tiles" id="sKpis"></div>
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
  <div class="muted" id="mLine"></div><span class="err" id="mMsg"></span>
  <div id="mBody">
    <div class="banner" id="mBanner"></div>
    <div class="sec"><h3>Is Redis keeping up?</h3><div class="tiles" id="mLatT"></div><div class="charts" id="mLatC"></div></div>
    <div class="sec"><h3>How busy is it?</h3><div class="tiles" id="mBusyT"></div><div class="charts" id="mBusyC"></div></div>
    <div class="sec"><h3>Warning signs</h3><div class="tiles compact" id="mWarn"></div></div>
    <details><summary>Details: memory, clients, keyspace, PING</summary><div class="sec"><div class="tiles compact" id="mDetT"></div><div class="charts" id="mDetC"></div></div></details>
  </div>
  <details><summary>How the monitor works</summary><p class="help">Read-only: every sample it times a PING and an MGET of a fixed sample of real <code>gen:*</code> keys, and reads INFO. Only INFO, PING, MGET and SCAN are ever sent. Latency charts plot the worst sample of each point on a log scale, with the 50 ms target and the site's read deadline drawn in; shaded bands are snapshots (BGSAVE) or AOF rewrites. Samples are saved to the run's <code>samples.jsonl</code>, with times in ms since the epoch (UTC), to line up with a stress run's files.</p></details>
</section>
`;

export const PANELS_JS = /* js */ `
const utc = t => new Date(t).toISOString().slice(11, 19);
const num = (v, d = 0) => v == null || Number.isNaN(v) ? "–" : Number(v).toLocaleString("en-US", {maximumFractionDigits: d, minimumFractionDigits: 0});
const msTxt = v => v == null ? "–" : v >= 1000 ? (v / 1000).toFixed(2) + " s" : v >= 10 ? Math.round(v) + " ms" : v.toFixed(2) + " ms";
const COLORS = ["var(--accent)", "var(--warn)", "var(--bad)", "var(--muted)"];

const fmtGiB = b => b == null ? "–" : (b / 1073741824).toFixed(2) + " GiB";
/** Rounds up to 1, 2, 2.5 or 5 × a power of ten, for a linear axis top. */
function niceCeil(v) {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v * 0.999) return m * p;
  return 10 * p;
}
/** Status class for a value against amber and red thresholds (higher is worse, or lower with low: true). */
function level(v, warnAt, badAt, low) {
  if (v == null || Number.isNaN(v)) return "";
  if (low) return v <= badAt ? "bad" : v <= warnAt ? "warn" : "ok";
  return v >= badAt ? "bad" : v >= warnAt ? "warn" : "ok";
}
/** A tile: one number, a plain label, an optional second line, and a status (ok, warn, bad). */
function tile(value, label, sub, status) {
  return '<div class="tile ' + (status || "") + '"><b>' + value + '</b><span class="lbl">' + label + '</span>' + (sub ? '<span class="sub">' + sub + '</span>' : "") + '</div>';
}

/**
 * A line chart with a labelled y-axis. Options: log (log scale, for latency), min/max (fixed linear
 * scale), refs [{v, label, color}] (dashed reference lines), limit (a red "stop" line), bands
 * [[t0, t1]] (shaded periods), marks [t] (vertical dashes at stage starts), h (height), wide, fmt, tick.
 */
function chart(title, pts, series, opts = {}) {
  const W = 300, H = opts.h || 96, PT = 6, PB = 4;
  const xs = pts.map(p => p.t);
  const t0 = xs[0], t1 = xs[xs.length - 1];
  const fmt = opts.fmt || (v => num(v, 1));
  const tick = opts.tick || fmt;
  const refs = (opts.refs || []).concat(opts.limit != null ? [{v: opts.limit, label: "stop", color: "var(--bad)"}] : []);
  const vals = [];
  for (const s of series) for (const p of pts) { const v = p[s.key]; if (typeof v === "number" && Number.isFinite(v)) vals.push(v); }
  let Y, ticks;
  if (opts.log) {
    const pos = vals.filter(v => v > 0);
    const lo = opts.lo ?? Math.pow(10, Math.floor(Math.log10(pos.length ? Math.min(...pos) : 1)));
    const top = Math.max(lo * 10, ...pos, ...refs.map(r => r.v));
    const hi = Math.pow(10, Math.ceil(Math.log10(top) - 1e-9));
    const a = Math.log10(lo), b = Math.log10(hi);
    Y = v => H - PB - (Math.log10(Math.max(v, lo)) - a) / (b - a) * (H - PT - PB);
    ticks = [];
    for (let e = Math.round(a); e <= Math.round(b); e++) ticks.push(Math.pow(10, e));
  }
  else {
    const lo = opts.min ?? 0;
    let hi = opts.max ?? niceCeil(Math.max(0, ...vals, ...refs.map(r => r.v), opts.floor || 0));
    if (hi <= lo) hi = lo + 1;
    Y = v => H - PB - (v - lo) / (hi - lo) * (H - PT - PB);
    ticks = [lo, (lo + hi) / 2, hi];
  }
  const X = t => t1 > t0 ? (t - t0) / (t1 - t0) * W : 0;
  const hline = (y, stroke, dash) => '<line x1="0" x2="' + W + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + stroke + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + ' vector-effect="non-scaling-stroke"/>';
  const grid = ticks.map(v => hline(Y(v), "var(--line)", "")).join("");
  const bands = (opts.bands || []).map(([a, b]) => { const x0 = X(Math.max(a, t0)), x1 = X(Math.min(b, t1)); return '<rect x="' + x0.toFixed(1) + '" y="0" width="' + Math.max(1, x1 - x0).toFixed(1) + '" height="' + H + '" fill="var(--warn-soft)"/>'; }).join("");
  const marks = (opts.marks || []).filter(m => m >= t0 && m <= t1).map(m => '<line x1="' + X(m).toFixed(1) + '" x2="' + X(m).toFixed(1) + '" y1="0" y2="' + H + '" stroke="var(--muted)" stroke-opacity=".5" stroke-dasharray="2 3" vector-effect="non-scaling-stroke"/>').join("");
  const refLines = refs.map(r => hline(Y(r.v), r.color || "var(--warn)", "5 4")).join("");
  const lines = series.map((s, i) => {
    let d = "", pen = false;
    for (const p of pts) {
      const v = p[s.key];
      if (typeof v !== "number" || !Number.isFinite(v)) { pen = false; continue; }
      d += (pen ? "L" : "M") + X(p.t).toFixed(1) + " " + Y(v).toFixed(1);
      pen = true;
    }
    return '<path d="' + d + '" fill="none" stroke="' + (s.color || COLORS[i]) + '" stroke-width="1.6" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
  }).join("");
  const pct = y => (100 * y / H).toFixed(1) + "%";
  const yLabels = ticks.map(v => '<span class="yl" style="top:' + pct(Y(v)) + '">' + tick(v) + '</span>').join("");
  const refLabels = refs.filter(r => r.label).map(r => '<span class="rl" style="top:' + pct(Y(r.v)) + ';color:' + (r.color || "var(--warn)") + '">' + esc(r.label) + '</span>').join("");
  const lastVal = s => { for (let i = pts.length - 1; i >= 0; i--) if (typeof pts[i][s.key] === "number") return pts[i][s.key]; return null; };
  const now = series.map((s, i) => (series.length > 1 ? '<span class="legend" style="background:' + (s.color || COLORS[i]) + '"></span>' + esc(s.label) + " " : "") + "<b>" + fmt(lastVal(s)) + "</b>").join(" ");
  return '<div class="chart' + (opts.wide ? " wide" : "") + '"><div class="head"><span>' + esc(title) + '</span><span>' + now + '</span></div>' +
    '<div class="plot" style="height:' + H + 'px"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="' + esc(title) + '">' + bands + grid + marks + refLines + lines + '</svg>' + yLabels + refLabels + '</div>' +
    '<div class="axis"><span>' + (pts.length ? utc(t0) : "") + '</span><span>' + (pts.length ? utc(t1) + " UTC" : "") + '</span></div></div>';
}
/** Periods where a point's key is truthy, as [[t0, t1]], for shaded bands. */
function bandsOf(pts, key) {
  const out = []; let start = null, prev = null;
  for (const p of pts) {
    if (p[key]) { if (start == null) start = prev ?? p.t; }
    else if (start != null) { out.push([start, p.t]); start = null; }
    prev = p.t;
  }
  if (start != null && prev != null) out.push([start, prev]);
  return out;
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
  const sp = c.stop || {};
  const p95 = l.pageMs && l.pageMs.p95;
  const total10 = 10 * (l.servedPerS || 0) + (l.errors || 0) + (l.timeouts || 0); // progress lines cover the last 10 s
  const errPct = total10 ? 100 * ((l.errors || 0) + (l.timeouts || 0)) / total10 : 0;
  const keepUp = l.sentPerS ? 100 * (l.servedPerS || 0) / l.sentPerS : null;
  $("sKpis").innerHTML = l.t ? [
    tile(num(l.servedPerS, 1), "Pages/s served", "of " + num(l.sentPerS, 1) + " sent · last 10 s", keepUp == null ? "" : level(keepUp, 95, 80, true)),
    tile(msTxt(p95), "Page time, p95", "p50 " + msTxt(l.pageMs && l.pageMs.p50) + " · p99 " + msTxt(l.pageMs && l.pageMs.p99) + " · goal under 2 s", level(p95, 2000, 5000)),
    tile(l.hitPct == null ? "–" : num(l.hitPct, 1) + "%", "Pages from the cache", fmtN(l.miss) + " misses · stop below " + num(100 - (sp.missPct ?? 5), 0) + "%", l.hitPct == null ? "" : level(l.hitPct, 100 - (sp.missPct ?? 5) / 2, 100 - (sp.missPct ?? 5), true)),
    tile(fmtN((l.errors || 0) + (l.timeouts || 0)), "Errors + timeouts", "last 10 s · " + fmtN(l.timeouts) + " timeouts · stop above " + num(sp.errorPct ?? 2, 0) + "%", level(errPct, (sp.errorPct ?? 2) / 2, sp.errorPct ?? 2)),
    tile(msTxt(l.probeMs), "Tesseract probe", "small query every 10 s · stop above " + msTxt(sp.probeMs ?? 5000), l.probeOk === false ? "bad" : level(l.probeMs, (sp.probeMs ?? 5000) / 2, sp.probeMs ?? 5000)),
    tile(fmtN(l.inFlight), "Requests in flight", "cap " + fmtN(c.cap) + " · " + fmtN(l.dropped) + " dropped", l.dropped ? "warn" : level(l.inFlight, c.cap * 0.5, c.cap * 0.9)),
    tile(msTxt(l.ttfbMs && l.ttfbMs.p95), "First byte, p95", "p50 " + msTxt(l.ttfbMs && l.ttfbMs.p50) + " · " + num(l.mbPerS, 1) + " MB/s received"),
    ...(mon ? [mon.error ? tile("–", "Redis monitor", esc(mon.error), "bad") : tile(msTxt(mon.mgetMs && mon.mgetMs.p95), "Redis read, p95 (monitor)", (mon.availableMb != null ? "host memory free " + num(mon.availableMb) + " MB" : ""), level(mon.mgetMs && mon.mgetMs.p95, 50, 250))] : [])
  ].join("") : "";
  const pts = x.series.map(p => ({t: p.t, sent: p.sentPerS, served: p.servedPerS, p50: p.pageMs && p.pageMs.p50, p95: p.pageMs && p.pageMs.p95, p99: p.pageMs && p.pageMs.p99, ttfb: p.ttfbMs && p.ttfbMs.p95, hit: p.hitPct, err: (p.errors || 0) + (p.timeouts || 0), inflight: p.inFlight, probe: p.probeMs, mem: p.monitor && p.monitor.availableMb, mget: p.monitor && p.monitor.mgetMs && p.monitor.mgetMs.p95}));
  const marks = (x.events || []).filter(e => e.type === "stage").map(e => e.startT);
  const o = {marks};
  const msTick = v => v >= 1000 ? v / 1000 + " s" : v + " ms";
  $("sCharts").innerHTML = pts.length ? [
    chart("Pages/s (dashes: stage starts)", pts, [{key: "sent", label: "sent", color: "var(--muted)"}, {key: "served", label: "served", color: "var(--accent)"}], {...o, wide: true, h: 120}),
    chart("Page time", pts, [{key: "p50", label: "p50", color: "var(--muted)"}, {key: "p95", label: "p95", color: "var(--accent)"}, {key: "p99", label: "p99", color: "var(--warn)"}], {...o, log: true, refs: [{v: 2000, label: "2 s goal (p95)", color: "var(--warn)"}], fmt: msTxt, tick: msTick, wide: true, h: 140}),
    chart("Pages from the cache", pts, [{key: "hit", label: "hits"}], {...o, min: 0, max: 100, limit: sp.missPct != null ? 100 - sp.missPct : null, fmt: v => num(v, 1) + "%", tick: v => num(v, 0) + "%"}),
    chart("Errors + timeouts (10 s)", pts, [{key: "err", label: "errors"}], {...o, floor: 5, fmt: v => num(v)}),
    chart("Tesseract probe", pts, [{key: "probe", label: "probe"}], {...o, log: true, limit: sp.probeMs ?? null, fmt: msTxt, tick: msTick}),
    chart("Requests in flight", pts, [{key: "inflight", label: "in flight"}], {...o, refs: c.cap ? [{v: c.cap, label: "cap", color: "var(--warn)"}] : [], fmt: v => num(v)}),
    chart("First byte, p95", pts, [{key: "ttfb", label: "p95"}], {...o, log: true, fmt: msTxt, tick: msTick}),
    ...(pts.some(p => p.mem != null) ? [chart("Redis read p95 (monitor)", pts, [{key: "mget", label: "p95"}], {...o, log: true, lo: 0.1, refs: [{v: 50, label: "50 ms", color: "var(--warn)"}], fmt: msTxt, tick: msTick}), chart("Host memory free (monitor)", pts, [{key: "mem", label: "MB"}], {...o, min: 0, limit: sp.minMemMb ?? null, fmt: v => num(v) + " MB"})] : [])
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
  $("mBody").hidden = !L;
  if (!L) return;
  // Thresholds. TARGET: the stress brief's goal for Redis reads at p99. The site gives a read
  // REDIS_READ_TIMEOUT_MS (250 ms on penn) per 50 keys, then renders the page from Tesseract.
  const TARGET_MS = 50, READ_TIMEOUT_MS = 250, MIN_FREE_MB = 2048;
  const deadline = READ_TIMEOUT_MS * Math.max(1, Math.ceil((m.keys || 100) / 50));
  const g = L.mgetMs || {}, pg = L.pingMs || {};
  const latSt = level(g.p99, TARGET_MS, deadline);
  const cpu = L.cpuMainPct ?? ((L.cpuUserPct ?? 0) + (L.cpuSysPct ?? 0));
  const cpuSt = level(cpu, 60, 85);
  const memSt = L.host ? level(L.host.availableMb, 2 * MIN_FREE_MB, MIN_FREE_MB, true) : "";
  const persisting = L.bgsaveInProgress || L.aofRewriteInProgress;
  const gib = mb => mb == null ? "–" : (mb / 1024).toFixed(1) + " GiB";

  // One sentence for the state of things, worst first.
  const stale = running && !viewingOld && L.ageS > 10;
  let bSt = "ok", bTxt = "Redis is keeping up.";
  if (latSt === "warn") { bSt = "warn"; bTxt = "Redis reads are slowing down."; }
  if (cpuSt === "bad" && bSt === "ok") { bSt = "warn"; bTxt = "Redis is close to a full CPU core."; }
  if (latSt === "bad") { bSt = "bad"; bTxt = "Redis reads would miss the site's deadline: pages fall back to Tesseract."; }
  if (memSt === "bad") { bSt = "bad"; bTxt = "Host memory is below the 2 GiB stop line."; }
  if (L.errorsLastMinute) { bSt = "bad"; bTxt = "The monitor can't read Redis: " + (L.lastError || "errors") + "."; }
  if (stale) { bSt = "warn"; bTxt = "No sample for " + L.ageS + " s."; }
  $("mBanner").className = "banner " + bSt;
  $("mBanner").innerHTML = esc(bTxt) + ' <span>Reads of ' + fmtN(m.keys) + ' keys: ' + msTxt(g.p99) + ' at p99 over the last minute (target ' + TARGET_MS + ' ms, site gives up at ' + deadline + ' ms) · CPU ' + num(cpu, 0) + '% of one core' + (persisting ? " · snapshot running" : "") + '</span>';

  $("mLatT").innerHTML = [
    tile(msTxt(g.p99), "Read of " + fmtN(m.keys) + " keys, p99", "last minute · p50 " + msTxt(g.p50) + " · worst " + msTxt(g.max) + (L.mgetNulls ? " · " + L.mgetNulls + " keys gone" : ""), latSt),
    tile(msTxt(pg.p99), "PING, p99", "last minute · p50 " + msTxt(pg.p50) + " · worst " + msTxt(pg.max), level(pg.p99, 10, 50)),
    tile(TARGET_MS + " ms / " + deadline + " ms", "Target / site deadline", "the site waits " + READ_TIMEOUT_MS + " ms per 50 keys, then skips the cache")
  ].join("");
  const p = m.series;
  const snap = bandsOf(p, "persisting");
  const latRefs = [{v: TARGET_MS, label: TARGET_MS + " ms target", color: "var(--warn)"}, {v: deadline, label: deadline + " ms deadline", color: "var(--bad)"}];
  $("mLatC").innerHTML = chart("Read latency (worst per point; shaded: snapshot running)", p, [{key: "mgetMs", label: "MGET " + m.keys + " keys"}, {key: "pingMs", label: "PING", color: "var(--muted)"}], {log: true, lo: 0.1, refs: latRefs, bands: snap, fmt: msTxt, tick: v => v >= 1000 ? v / 1000 + " s" : v + " ms", h: 150, wide: true});

  $("mBusyT").innerHTML = [
    tile(num(L.opsPerS), "Commands/s", "a report page is about one MGET"),
    tile(num(cpu, 0) + "%", "Redis CPU, of one core", "Redis runs commands on one core; 100% is its ceiling", cpuSt),
    tile(num(L.netOutMBps, 1) + " MB/s", "Network out of Redis", "")
  ].join("");
  $("mBusyC").innerHTML = [
    chart("Commands/s", p, [{key: "opsPerS", label: "ops/s"}], {fmt: v => num(v), bands: snap}),
    chart("Redis CPU, % of one core", p, [{key: "cpuMainPct", label: "main thread"}], {min: 0, max: 100, refs: [{v: 85, label: "85%", color: "var(--warn)"}], bands: snap, fmt: v => num(v, 0) + "%"}),
    chart("Network out", p, [{key: "netOutMBps", label: "MB/s"}], {fmt: v => num(v, 1) + " MB/s", bands: snap})
  ].join("");

  const forkMs = (L.latestForkUsec || 0) / 1000;
  $("mWarn").innerHTML = [
    tile(L.bgsaveInProgress ? "running" : L.aofRewriteInProgress ? "AOF rewrite" : "idle", "Snapshot", "last fork paused Redis " + num(forkMs, 0) + " ms", persisting ? "warn" : level(forkMs, 500, 1000)),
    tile(L.host ? gib(L.host.availableMb) : "–", "Host memory free", L.host ? "of " + gib(L.host.totalMb) + " · stop below 2 GiB" : "Linux only", memSt),
    tile(fmtN(L.evictedKeys), "Evicted keys", L.evictedPerS ? num(L.evictedPerS, 1) + "/s now" : "since Redis started", L.evictedPerS ? "bad" : L.evictedKeys ? "warn" : "ok"),
    tile(fmtN(L.rejectedConnections), "Rejected connections", "since Redis started", L.rejectedConnections ? "bad" : "ok"),
    tile(fmtN(L.blockedClients), "Blocked clients", "", L.blockedClients ? "warn" : "ok"),
    tile(fmtN(L.aofDelayedFsync), "Delayed AOF fsyncs", "disk couldn't keep up", L.aofDelayedFsync ? "warn" : "ok"),
    tile(fmtN(L.errorsLastMinute || 0), "Failed samples", "last minute", L.errorsLastMinute ? "bad" : "ok")
  ].join("");

  const hits = L.hitsPerS, misses = L.missesPerS;
  $("mDetT").innerHTML = [
    tile(fmtGiB(L.usedMemory) + (L.maxmemory ? " of " + fmtGiB(L.maxmemory) : ""), "Redis memory", "fragmentation " + num(L.fragmentation, 2)),
    tile(fmtN(L.keys), "Keys", ""),
    tile(fmtN(L.connectedClients), "Clients connected", ""),
    tile(num(hits) + " / " + num(misses), "Keyspace hits / misses per s", hits != null && hits + misses > 0 ? num(100 * hits / (hits + misses), 1) + "% hits (the monitor's own MGET adds " + fmtN(m.keys) + " hits per sample)" : ""),
    tile(L.load1 != null ? num(L.load1, 2) : "–", "Host load (1 min)", "")
  ].join("");
  $("mDetC").innerHTML = [
    chart("Redis memory", p, [{key: "usedMemory", label: "used"}], {min: 0, max: L.maxmemory || undefined, fmt: fmtGiB}),
    chart("Clients connected", p, [{key: "clients", label: "clients"}], {fmt: v => num(v)}),
    chart("Host memory free", p, [{key: "availableMb", label: "free"}], {min: 0, max: L.host ? L.host.totalMb : undefined, limit: MIN_FREE_MB, fmt: gib})
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
