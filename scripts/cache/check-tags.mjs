// Renders every state and the most populous counties through the diagnostics route of a running
// site (ENABLE_DEBUG_ROUTES=true, REDIS_URL set) and fails if any generator's data cannot be mapped
// to an invalidation tag, i.e. would never be purged by a release. Also lists every generator left
// uncached, with the reason.
//
//   node scripts/cache/check-tags.mjs [base=http://localhost:3301] [counties=100] [concurrency=2]
import {readFileSync} from "node:fs";

const [base = "http://localhost:3301", countyCount = "100", concurrency = "2"] = process.argv.slice(2);

const members = readFileSync(new URL("../../data/members.jsonl", import.meta.url), "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));
const states = members.filter(m => m.dimension === "Geography" && m.hierarchy === "State").map(m => m.slug);
const counties = members.filter(m => m.dimension === "Geography" && m.hierarchy === "County")
  .sort((a, b) => (b.zvalue ?? 0) - (a.zvalue ?? 0)).slice(0, Number(countyCount)).map(m => m.slug);
const slugs = [...states, ...counties];

const unmapped = new Map();
const uncached = new Map();
let next = 0;
let failedRequests = 0;
async function worker() {
  while (next < slugs.length) {
    const slug = slugs[next++];
    const res = await fetch(`${base}/api/debug/report?slug=geo&id=${slug}&generators=all`).catch(e => ({ok: false, statusText: e.message}));
    if (!res.ok) {
      failedRequests++;
      console.error(`${slug}: ${res.status ?? ""} ${res.statusText}`);
      continue;
    }
    const body = await res.json();
    for (const g of body.all?.generators ?? []) {
      if (!g.uncached) continue;
      const target = /maps to no tag/.test(g.uncached) ? unmapped : uncached;
      const key = `${g.id} ${g.name}: ${g.uncached}`;
      if (!target.has(key)) target.set(key, {count: 0, example: `${slug} ${g.url}`});
      target.get(key).count++;
    }
    process.stdout.write(".");
  }
}
await Promise.all(Array.from({length: Number(concurrency)}, worker));
console.log(`\n${slugs.length} reports checked (${states.length} states, ${counties.length} counties)`);
if (uncached.size) {
  console.log("\nLeft uncached (not a tag problem):");
  for (const [key, {count, example}] of uncached) console.log(`  ${key}  (${count} reports, e.g. ${example})`);
}
if (unmapped.size) {
  console.log("\nURLs that map to no tag:");
  for (const [key, {count, example}] of unmapped) console.log(`  ${key}  (${count} reports, e.g. ${example})`);
  process.exit(1);
}
if (failedRequests) process.exit(1);
console.log("Every generator URL maps to a tag.");
