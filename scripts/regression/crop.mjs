// Crops a region out of a (very tall) full-page screenshot without any image library, using a
// headless browser canvas. Usage: node scripts/regression/crop.mjs <in.png> <y> <height> <out.png> [width]
import {chromium} from "playwright";
import {readFileSync, writeFileSync} from "node:fs";
const [input, y, height, output, width] = process.argv.slice(2);
const data = `data:image/png;base64,${readFileSync(input).toString("base64")}`;
const browser = await chromium.launch();
const page = await browser.newPage();
const out = await page.evaluate(async ({data, y, height, width}) => {
  const img = new Image();
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = data; });
  const w = width ? Number(width) : img.width;
  const h = Math.min(Number(height), img.height - Number(y));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, Number(y), w, h, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}, {data, y, height, width});
writeFileSync(output, Buffer.from(out.split(",")[1], "base64"));
await browser.close();
console.log(`wrote ${output}`);
