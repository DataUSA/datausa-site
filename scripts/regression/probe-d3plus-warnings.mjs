// Audits the CMS chart configs against the installed d3plus version: opens a report with
// `?d3plus-warnings=1` (which re-enables d3plus's unknown-config warnings in VizIsland), scrolls
// through so every chart renders, and prints the distinct warnings.
// Usage: node scripts/regression/probe-d3plus-warnings.mjs http://localhost:3301/profile/geo/massachusetts
import {chromium} from "playwright";
const base = process.argv[2] ?? "http://localhost:3301/profile/geo/massachusetts";
const url = `${base}${base.includes("?") ? "&" : "?"}d3plus-warnings=1`;
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width: 1440, height: 900}});
const warnings = new Map();
page.on("console", m => {
  if (m.type() === "warning" || m.type() === "warn" || /d3plus/i.test(m.text())) {
    const text = m.text().split("\n")[0].slice(0, 220);
    warnings.set(text, (warnings.get(text) ?? 0) + 1);
  }
});
await page.goto(url, {waitUntil: "domcontentloaded"});
await page.waitForLoadState("networkidle", {timeout: 30000}).catch(() => {});
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); } });
await page.waitForFunction(() => Array.from(document.querySelectorAll("[data-viz-id]")).every(el => el.querySelector("svg, [class*='message']")), undefined, {timeout: 90000}).catch(() => {});
await page.waitForTimeout(3000);
for (const [text, n] of [...warnings.entries()].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(4)}  ${text}`);
console.log(`distinct warnings: ${warnings.size}`);
await browser.close();
