// Stand-alone d3plus harness: renders one Geomap with the site theme outside React so theme/config
// interactions can be bisected from the URL.
//   ?omit=a,b      drop these theme keys       ?only=a,b   keep only these theme keys
//   ?cfgomit=a,b   drop these chart config keys
// Build: npx esbuild scripts/regression/harness/geomap.ts --bundle --format=iife --alias:@=./src \
//   --define:TESSERACT='"https://api-ohio.datausa.io/"' --outfile=public/_harness/geomap.js
// Open:  http://localhost:3301/_harness/geomap.html?cfgomit=time
import {Geomap} from "@d3plus/core";
import {theme} from "@/lib/viz/theme";

declare const TESSERACT: string;
type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const q = new URLSearchParams(location.search);
const list = (key: string) => (q.get(key) || "").split(",").filter(Boolean);
let themeUsed: AnyRecord = {...(theme as AnyRecord)};
for (const k of list("omit")) delete themeUsed[k];
if (q.has("only")) {
  themeUsed = {};
  for (const k of list("only")) themeUsed[k] = (theme as AnyRecord)[k];
}
const config: AnyRecord = {
  data: `${TESSERACT}tesseract/data?cube=pums_5&drilldowns=PUMA,Year&measures=Total+Population`,
  dataFormat: (resp: AnyRecord) => resp.data,
  colorScale: "Total Population",
  colorScaleConfig: {axisConfig: {tickFormat: (d: unknown) => String(d), title: "Resident Population"}, scale: "jenks"},
  groupBy: "PUMA ID",
  label: (d: AnyRecord) => d.PUMA,
  projection: "geoMercator",
  topojson: "/topojson/PUMA.json",
  topojsonId: (d: AnyRecord) => d.id,
  topojsonFilter: (d: AnyRecord) => String(d.id).startsWith("79500US25"),
  time: "Year"
};
for (const k of list("cfgomit")) delete config[k];
const viz = new Geomap().select(document.querySelector(".d3plus") as HTMLElement).config(themeUsed).config(config);
(window as AnyRecord).viz = viz;
(window as AnyRecord).themeUsed = themeUsed;
viz.render();
