// Full-page screenshot of one or more site paths, with the page's console errors:
//   node scripts/regression/shot.mjs <out dir> [--width 1280] [--y <top>] [--clip <height>] /path [/path…]
import {chromium} from "playwright";

const args = process.argv.slice(2);
const out = args.shift();
let width = 1280, clip = 0, top = 0;
const paths = [];
while (args.length) {
  const a = args.shift();
  if (a === "--width") width = Number(args.shift());
  else if (a === "--clip") clip = Number(args.shift());
  else if (a === "--y") top = Number(args.shift());
  else paths.push(a);
}
const base = process.env.BASE_URL ?? "http://localhost:3301";
const browser = await chromium.launch();
const page = await browser.newPage({viewport: {width, height: 900}});
for (const path of paths) {
  const errors = [];
  const onConsole = m => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); };
  const onError = e => errors.push(`pageerror: ${String(e).slice(0, 300)}`);
  page.on("console", onConsole);
  page.on("pageerror", onError);
  const response = await page.goto(base + path, {waitUntil: "networkidle", timeout: 120000});
  await page.waitForTimeout(2500);
  const file = `${out}/${path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"}-${width}${top ? `-${top}` : ""}.png`;
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({path: file, fullPage: true, ...(clip ? {clip: {x: 0, y: top, width, height: Math.max(1, Math.min(clip, height - top))}} : {})});
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log(`${response?.status()} ${path} (${height}px tall) -> ${file}${overflow > 0 ? ` (page overflows sideways by ${overflow}px)` : ""}`);
  for (const e of errors) console.log(`  console: ${e}`);
  page.off("console", onConsole);
  page.off("pageerror", onError);
}
await browser.close();
