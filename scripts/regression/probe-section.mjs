// Screenshot one section of one page on one site after a long wait and print the size of each chart in it.
//   node scripts/regression/probe-section.mjs http://localhost:3301 /profile/geo/massachusetts demographics desktop out.png
import {chromium} from "playwright";

const [base, path, sectionId, vp = "desktop", out = "scripts/regression/out/probe.png"] = process.argv.slice(2);
const viewport = vp === "mobile" ? {width: 390, height: 844} : {width: 1440, height: 900};
const browser = await chromium.launch();
const page = await browser.newPage({viewport});
await page.goto(base + path, {waitUntil: "domcontentloaded", timeout: 180000});
await page.waitForLoadState("networkidle", {timeout: 45000}).catch(() => {});
const sel = `section#${sectionId}, .cp-section.${sectionId}`; // the legacy site also has an empty anchor div with the id
const section = page.locator(sel).first();
await section.evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100));
await page.waitForTimeout(Number(process.env.WAIT_MS ?? 20000));
const info = await section.evaluate(el => Array.from(el.querySelectorAll("[data-viz-id], .cp-viz-container")).map(v => {
  const r = v.getBoundingClientRect();
  const svg = v.querySelector("svg");
  const s = svg ? svg.getBoundingClientRect() : null;
  return {
    topic: v.closest("[id]")?.id,
    box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
    svg: s ? [Math.round(s.width), Math.round(s.height)] : null,
    paths: v.querySelectorAll("path").length
  };
}));
console.log(`${base}${path} #${sectionId} ${vp}`);
console.log(JSON.stringify(info));
await page.screenshot({path: out});
await browser.close();
