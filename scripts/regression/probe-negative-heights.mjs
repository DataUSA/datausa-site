// Lists SVG elements that were rendered with a negative height (d3plus sizing against a collapsed
// container) and where they live. Usage: node scripts/regression/probe-negative-heights.mjs <url>
import {chromium} from "playwright";
const url = process.argv[2] ?? "http://localhost:3301/profile/geo/massachusetts";
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const errors = [];
page.on("console", m => { if (m.type() === "error" && /negative value/.test(m.text())) errors.push(m.text().slice(0, 120)); });
await page.goto(url, {waitUntil: "domcontentloaded"});
await page.waitForLoadState("networkidle", {timeout: 30000}).catch(() => {});
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 200)); } });
await page.waitForLoadState("networkidle", {timeout: 30000}).catch(() => {});
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("svg, rect").forEach(el => {
    const h = el.getAttribute("height");
    if (h !== null && Number(h) < 0) {
      const viz = el.closest("[data-viz-id], .cp-viz, .viz, [class*='VizIsland'], [class*='viz']");
      const section = el.closest("section, [id]");
      out.push({tag: el.tagName, height: h, cls: (el.getAttribute("class") || "").slice(0, 60), vizId: viz?.getAttribute("data-viz-id") ?? viz?.className?.toString().slice(0, 40), containerHeight: viz ? viz.getBoundingClientRect().height : null, sectionId: section?.id, display: viz ? getComputedStyle(viz).display : null, parentRect: el.parentElement?.getBoundingClientRect().height});
    }
  });
  return out;
});
console.log("console negative-height errors:", errors.length);
console.log(JSON.stringify(info.slice(0, 25), null, 1));
await browser.close();
