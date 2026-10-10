// Inspect one chart island's d3plus state: svg size, drawn groups and size-related console errors,
// before and after a window resize.
//   node scripts/regression/probe-geomap.mjs http://localhost:3301 /profile/geo/massachusetts "#population_by_location" [desktop|mobile]
import {chromium} from "playwright";

const [base, path, topic, vp = "desktop"] = process.argv.slice(2);
const viewport = vp === "mobile" ? {width: 390, height: 844} : {width: 1440, height: 900};
const browser = await chromium.launch();
const page = await browser.newPage({viewport});
const errors = [];
page.on("console", msg => { if (msg.type() === "error" || msg.type() === "warning") errors.push(msg.text().slice(0, 160)); });
page.on("response", res => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url().split("?")[0]}`); });
await page.goto(base + path, {waitUntil: "domcontentloaded", timeout: 180000});
await page.waitForLoadState("networkidle", {timeout: 45000}).catch(() => {});
await page.locator(topic).first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100));
const state = () => page.evaluate(sel => {
  const island = document.querySelector(`${sel} [data-viz-id]`);
  const fig = island?.querySelector("[class*=figure]");
  const svg = island?.querySelector("svg");
  const box = el => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
  const count = s => island?.querySelectorAll(s).length ?? null;
  return {
    island: box(island), figure: box(fig), d3plus: box(island?.querySelector(".d3plus")),
    svgAttrs: svg ? [svg.getAttribute("width"), svg.getAttribute("height"), svg.getAttribute("style")] : null,
    tiles: count(".d3plus-geomap-tileGroup image"), shapes: count(".d3plus-geomap-zoomGroup path"),
    colorScaleRects: count(".d3plus-ColorScale rect"), textNodes: count("text"),
    shapeFills: [...new Set(Array.from(island?.querySelectorAll("path[fill]") ?? []).map(p => p.getAttribute("fill")))].slice(0, 8),
    negativeHeightNodes: Array.from(island?.querySelectorAll("[height]") ?? []).filter(e => Number(e.getAttribute("height")) < 0).map(e => `${e.tagName}:${e.getAttribute("height")}`).slice(0, 5)
  };
}, topic);
for (const t of [3000, 6000, 10000]) {
  await page.waitForTimeout(t === 3000 ? 3000 : 3000);
  console.log(`after ${t}ms:`, JSON.stringify(await state()));
}
await page.evaluate(() => window.dispatchEvent(new Event("resize")));
await page.waitForTimeout(6000);
console.log("after resize:", JSON.stringify(await state()));
console.log("console errors/warnings:", JSON.stringify([...new Set(errors)].slice(0, 25), null, 1));
await browser.close();
