// Stand-alone BarChart with the site theme: compares label rendering with and without a theme key.
//   ?omit=a,b drops theme keys; ?nosplit=1 removes the legacy split from the generic label config.
import {BarChart} from "@d3plus/core";
import {theme} from "@/lib/viz/theme";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const q = new URLSearchParams(location.search);
const t: AnyRecord = JSON.parse(JSON.stringify({...(theme as AnyRecord)}, (k, v) => typeof v === "function" ? v : v));
const used: AnyRecord = {...(theme as AnyRecord)};
for (const k of (q.get("omit") || "").split(",").filter(Boolean)) delete used[k];
if (q.get("nosplit")) {
  const sc = {...used.shapeConfig, labelConfig: {...used.shapeConfig.labelConfig}};
  delete sc.labelConfig.split;
  if (sc.Bar) { sc.Bar = {...sc.Bar, labelConfig: {...sc.Bar.labelConfig}}; delete sc.Bar.labelConfig.split; }
  used.shapeConfig = sc;
}
void t;
if (q.get("domainTicks")) {
  for (const k of ["axisConfig", "xConfig", "yConfig"]) used[k] = {...used[k], domainTicks: true};
}
// Mimics the population pyramid: stacked, one group negative, a timeline, custom Bar label config.
const buckets = Number(q.get("buckets") || 15);
const data: AnyRecord[] = [];
for (const Year of [2023, 2024]) for (let b = 0; b < buckets; b++) {
  const start = 5 + b * 5; const Age = `${start} to ${start + 4}`; const m = 60 + Math.round(60 * Math.sin(b / 4)); const w = m + 5;
  data.push({Age, Sex: "Men", Population: -m, Year}, {Age, Sex: "Women", Population: w, Year});
}
// ?svg=1 mimics @d3plus/react, which hands d3plus a pre-made <svg width="100%" height="100%"> inside the container.
const container = document.querySelector(".d3plus") as HTMLElement;
if (q.get("svg")) container.innerHTML = '<svg width="100%" height="100%"></svg>';
const target = q.get("svg") ? (container.querySelector("svg") as SVGElement) : container;
const viz = new BarChart().select(target as HTMLElement).config(used).config({
  data, discrete: "y", groupBy: "Sex", groupPadding: 2, stacked: true, time: "Year", x: "Population", y: "Age", label: (d: AnyRecord) => d.Age,
  legend: !q.get("nolegend"), ...(q.get("noheight") ? {} : {height: 500}),
  xConfig: {title: "Workforce", tickFormat: (d: number) => String(Math.abs(d))}, yConfig: {title: false, ticks: []},
  shapeConfig: {Bar: {labelConfig: {padding: 2, fontSize: () => 12}, fill: (d: AnyRecord) => d.Sex === "Men" ? "#17223d" : "#e04f3a"}}
});
(window as AnyRecord).viz = viz;
viz.render();
