// Quick headless check of one page on the rewrite: console errors, failed requests, rendered counts and
// full-page screenshots at desktop and mobile widths. Usage: S=<outdir> node scripts/regression/probe-page.mjs <url> <name>
import {chromium} from "playwright";
const url = process.argv[2] ?? "http://localhost:3301/";
const out = process.argv[3] ?? "home";
for (const vp of [{name: "desktop", width: 1440, height: 900}, {name: "mobile", width: 390, height: 844}]) {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: vp});
  const errors = [], failed = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("response", r => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 120)}`); });
  await page.goto(url, {waitUntil: "domcontentloaded"});
  await page.waitForLoadState("networkidle", {timeout: 30000}).catch(() => {});
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({
    title: document.title,
    mapPaths: document.querySelectorAll(".viz svg path").length,
    tiles: document.querySelectorAll(".usa-tile").length,
    tileImgs: Array.from(document.querySelectorAll(".usa-tile .image")).filter(el => getComputedStyle(el).backgroundImage.includes("url")).length,
    inlineSvgs: document.querySelectorAll(".inline-svg svg").length,
    h1h2: Array.from(document.querySelectorAll("h1, h2")).map(h => h.textContent.trim().slice(0, 60)),
    bodyHeight: document.body.scrollHeight,
    overflowX: document.documentElement.scrollWidth > window.innerWidth
  }));
  console.log(JSON.stringify({viewport: vp.name, ...info, errors: [...new Set(errors)].slice(0, 5), failed: [...new Set(failed)].slice(0, 8)}, null, 1));
  await page.screenshot({path: `${process.env.S}/${out}-${vp.name}.png`, fullPage: true});
  await browser.close();
}
