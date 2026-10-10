// Loads the harness page for each variant and prints what got drawn.
//   node scripts/regression/harness/probe.mjs "" "cfgomit=time" "omit=colorScaleConfig"
import {chromium} from "playwright";

const base = process.env.HARNESS_URL ?? "http://localhost:3301/_harness/geomap.html";
const browser = await chromium.launch();
for (const variant of process.argv.slice(2)) {
  const page = await browser.newPage({viewport: {width: 1000, height: 800}});
  const errors = [];
  page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text().slice(0, 90)); });
  page.on("pageerror", err => errors.push(`pageerror ${String(err).slice(0, 120)}`));
  await page.goto(`${base}?${variant}`, {waitUntil: "load", timeout: 60000});
  await page.waitForTimeout(Number(process.env.WAIT_MS ?? 12000));
  const state = await page.evaluate(() => {
    const el = document.querySelector(".d3plus");
    const n = s => el.querySelectorAll(s).length;
    const svg = el.querySelector("svg");
    return {
      svg: svg ? [svg.getAttribute("width"), svg.getAttribute("height")] : null,
      shapes: n(".d3plus-geomap-zoomGroup path"), tiles: n(".d3plus-geomap-tileGroup image"), colorScale: n(".d3plus-ColorScale *"),
      negative: Array.from(el.querySelectorAll("[height]")).filter(e => Number(e.getAttribute("height")) < 0).map(e => `${e.tagName}:${Math.round(Number(e.getAttribute("height")))}`).slice(0, 3),
      margin: window.viz && window.viz._margin,
      shapeFills: [...new Set(Array.from(el.querySelectorAll("path[fill]")).map(p => p.getAttribute("fill")))].slice(0, 8),
      scaleFills: [...new Set(Array.from(el.querySelectorAll(".d3plus-ColorScale [fill], .d3plus-ColorScale rect")).map(p => p.getAttribute("fill") || getComputedStyle(p).fill))].slice(0, 8)
    };
  });
  console.log(`[${variant || "baseline"}] ${JSON.stringify(state)} errors=${JSON.stringify([...new Set(errors)].slice(0, 3))}`);
  await page.close();
}
await browser.close();
