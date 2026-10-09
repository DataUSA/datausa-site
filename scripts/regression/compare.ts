/**
 * Automated comparison of the legacy site (port 3300) and the rewrite (port 3301).
 *
 *   npx tsx scripts/regression/compare.ts /profile/geo/massachusetts [/profile/geo/boston-ma ...]
 *   npx tsx scripts/regression/compare.ts --only=new /profile/geo/suffolk-county-ma
 *
 * For every URL and viewport it loads both sites in headless Chromium, scrolls through the page so
 * lazy charts render, then records: console errors, failed requests, rendered chart (SVG) count,
 * visible section ids, text content hash of the hero, and full-page screenshots under
 * `scripts/regression/out/`. Differences are summarised at the end.
 */
import {chromium, type Page} from "playwright";
import {mkdirSync, writeFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";

const LEGACY = process.env.LEGACY_URL ?? "http://localhost:3300";
const NEW = process.env.NEW_URL ?? "http://localhost:3301";
const OUT = join("scripts", "regression", "out");
const VIEWPORTS = [{name: "desktop", width: 1440, height: 900}, {name: "mobile", width: 390, height: 844}];

interface Capture {
  site: string;
  url: string;
  viewport: string;
  status: number | null;
  loadMs: number;
  consoleErrors: string[];
  failedRequests: string[];
  svgCount: number;
  sectionIds: string[];
  heroText: string;
  heroHash: string;
  screenshot: string;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = 700;
    for (let y = 0; y < document.body.scrollHeight + step; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
}

async function capture(base: string, site: string, path: string, viewport: typeof VIEWPORTS[number]): Promise<Capture> {
  const browser = await chromium.launch({args: ["--disable-dev-shm-usage"]});
  const context = await browser.newContext({viewport: {width: viewport.width, height: viewport.height}, deviceScaleFactor: 1});
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text().split("\n")[0].slice(0, 200)); });
  page.on("requestfailed", req => failedRequests.push(`${req.failure()?.errorText ?? "failed"} ${req.url().split("?")[0]}`));
  page.on("response", res => { if (res.status() >= 400 && !res.url().includes("__nextjs")) failedRequests.push(`${res.status()} ${res.url().split("?")[0]}`); });
  const started = Date.now();
  const response = await page.goto(`${base}${path}`, {waitUntil: "domcontentloaded", timeout: 180000});
  await page.waitForLoadState("networkidle", {timeout: 45000}).catch(() => {});
  await scrollThrough(page);
  await page.waitForLoadState("networkidle", {timeout: 45000}).catch(() => {});
  // The rewrite loads charts lazily: wait until every chart island has rendered (or reported an
  // error) so the screenshot and counts reflect the finished page, as they do for the legacy site.
  await page.waitForFunction(() => {
    const islands = Array.from(document.querySelectorAll("[data-viz-id]"));
    return islands.every(el => el.querySelector("svg, [class*='message'], [class*='error']"));
  }, undefined, {timeout: 90000}).catch(() => {});
  await page.waitForTimeout(3000);
  const loadMs = Date.now() - started;
  const info = await page.evaluate(() => ({
    svgCount: document.querySelectorAll("svg.d3plus, .d3plus svg, .cp-viz svg, [data-viz-id] svg, .visualization svg").length,
    sectionIds: Array.from(document.querySelectorAll("section[id], .cp-section[id], .Section .anchor[id]")).map(el => el.id).filter(Boolean),
    heroText: (document.querySelector("#Splash") as HTMLElement | null)?.innerText.replace(/\s+/g, " ").trim() ?? ""
  }));
  const safe = `${site}-${viewport.name}-${path.replace(/[^a-z0-9]+/gi, "_")}`.replace(/_+$/, "");
  const screenshot = join(OUT, `${safe}.png`);
  await page.screenshot({path: screenshot, fullPage: true});
  // Full-page screenshots resize the viewport, which both sites' lazily rendered charts react to;
  // per-section screenshots taken with each section scrolled into view are the reliable visual diff.
  const sectionDir = join(OUT, safe);
  mkdirSync(sectionDir, {recursive: true});
  const sections = page.locator("section[id], .cp-section[id]");
  const count = await sections.count();
  for (let i = 0; i < count; i++) {
    const section = sections.nth(i);
    const id = (await section.getAttribute("id")) || `section-${i}`;
    try {
      await section.scrollIntoViewIfNeeded({timeout: 5000});
      await page.waitForTimeout(1200);
      await section.screenshot({path: join(sectionDir, `${id.replace(/[^a-z0-9_-]+/gi, "_")}.png`), timeout: 20000, animations: "disabled"});
    }
    catch {
      // a section that cannot be captured (e.g. zero height) is skipped
    }
  }
  await browser.close();
  return {
    site, url: path, viewport: viewport.name, status: response?.status() ?? null, loadMs,
    consoleErrors: Array.from(new Set(consoleErrors)).slice(0, 20),
    failedRequests: Array.from(new Set(failedRequests)).slice(0, 20),
    svgCount: info.svgCount, sectionIds: info.sectionIds, heroText: info.heroText,
    heroHash: createHash("sha1").update(info.heroText).digest("hex").slice(0, 10), screenshot
  };
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.find(a => a.startsWith("--only="))?.slice(7);
  const paths = args.filter(a => !a.startsWith("--"));
  if (!paths.length) throw new Error("Pass at least one path, e.g. /profile/geo/massachusetts");
  mkdirSync(OUT, {recursive: true});
  const results: Capture[] = [];
  for (const path of paths) {
    for (const viewport of VIEWPORTS) {
      for (const [base, site] of [[LEGACY, "legacy"], [NEW, "new"]] as const) {
        if ((only === "new" && site === "legacy") || (only === "legacy" && site === "new")) continue;
        try {
          results.push(await capture(base, site, path, viewport));
        }
        catch (error) {
          console.error(`capture failed for ${site} ${path} ${viewport.name}: ${(error as Error).message}`);
        }
      }
    }
  }
  writeFileSync(join(OUT, "results.json"), JSON.stringify(results, null, 2));
  for (const r of results) {
    console.log(`\n[${r.site} ${r.viewport}] ${r.url} status=${r.status} load=${r.loadMs}ms svgs=${r.svgCount} sections=${r.sectionIds.length} hero=${r.heroHash}`);
    if (r.consoleErrors.length) console.log(`  console errors (${r.consoleErrors.length}):`, r.consoleErrors.slice(0, 5).map(e => `\n    - ${e}`).join(""));
    if (r.failedRequests.length) console.log(`  failed requests (${r.failedRequests.length}):`, r.failedRequests.slice(0, 8).map(e => `\n    - ${e}`).join(""));
  }
  for (const path of paths) {
    for (const viewport of VIEWPORTS) {
      const a = results.find(r => r.site === "legacy" && r.url === path && r.viewport === viewport.name);
      const b = results.find(r => r.site === "new" && r.url === path && r.viewport === viewport.name);
      if (!a || !b) continue;
      const missing = a.sectionIds.filter(id => !b.sectionIds.includes(id));
      const extra = b.sectionIds.filter(id => !a.sectionIds.includes(id));
      console.log(`\n== ${path} (${viewport.name}) == charts legacy=${a.svgCount} new=${b.svgCount}; hero text ${a.heroText === b.heroText ? "identical" : "DIFFERS"}; sections missing in new: [${missing.join(", ")}] extra: [${extra.join(", ")}]`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
