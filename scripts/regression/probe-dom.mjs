// Print the box and classes of every element matching a selector after the page settles.
//   SCROLL_TO="#demographics" node scripts/regression/probe-dom.mjs http://localhost:3301 /profile/geo/massachusetts "#population_by_location svg > g" [desktop|mobile]
import {chromium} from "playwright";

const [base, path, selector, vp = "desktop"] = process.argv.slice(2);
const viewport = vp === "mobile" ? {width: 390, height: 844} : {width: 1440, height: 900};
const browser = await chromium.launch();
const page = await browser.newPage({viewport});
await page.goto(base + path, {waitUntil: "domcontentloaded", timeout: 180000});
await page.waitForLoadState("networkidle", {timeout: 45000}).catch(() => {});
if (process.env.SCROLL_TO) {
  await page.locator(process.env.SCROLL_TO).first().evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100));
}
await page.waitForTimeout(Number(process.env.WAIT_MS ?? 15000));
const rows = await page.evaluate(sel => Array.from(document.querySelectorAll(sel)).slice(0, 80).map(el => {
  const r = el.getBoundingClientRect();
  const cls = (el.getAttribute("class") || "").trim().split(/\s+/).filter(Boolean).slice(0, 4).join(".");
  const tag = el.tagName.toLowerCase();
  const extra = tag === "image" ? ` href=${(el.getAttribute("href") || el.getAttribute("xlink:href") || "").slice(0, 70)}` : tag === "text" ? ` "${(el.textContent || "").slice(0, 30)}"` : "";
  const style = el.getAttribute("style") ? ` style="${el.getAttribute("style").slice(0, 80)}"` : "";
  return `${tag}${el.id ? `#${el.id}` : ""}${cls ? `.${cls}` : ""} @ ${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} children=${el.children.length}${extra}${style}`;
}), selector);
console.log(`${base}${path} ${vp} "${selector}"\n${rows.join("\n")}`);
await browser.close();
