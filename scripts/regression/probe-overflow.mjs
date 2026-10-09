// Finds elements that extend past the right edge of a narrow viewport (horizontal scrolling on
// phones). Usage: node scripts/regression/probe-overflow.mjs <url> [width]
import {chromium} from "playwright";
const url = process.argv[2] ?? "http://localhost:3301/profile/geo/massachusetts";
const width = Number(process.argv[3] ?? 390);
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width, height: 844}});
await page.goto(url, {waitUntil: "domcontentloaded"});
await page.waitForLoadState("networkidle", {timeout: 30000}).catch(() => {});
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); });
await page.waitForTimeout(3000);
const info = await page.evaluate(w => {
  const out = [];
  document.querySelectorAll("body *").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > w + 1 || r.left < -1) && getComputedStyle(el).position !== "fixed") {
      out.push({tag: el.tagName, id: el.id, cls: (typeof el.className === "string" ? el.className : "").slice(0, 70), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), section: el.closest("section[id], [id]")?.id});
    }
  });
  return {scrollWidth: document.documentElement.scrollWidth, offenders: out.slice(0, 25)};
}, width);
console.log(JSON.stringify(info, null, 1));
await browser.close();
