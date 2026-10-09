// Compares the text variables of a report between the legacy site and the rewrite.
//   node scripts/regression/compare-variables.mjs <slug> <id> [legacy.json]
// Fetches http://localhost:3300/api/profile?slug=&id= (or reads a saved payload) and the rewrite's
// /api/debug/report?full=true, then lists variables that differ (ignoring colours, hosts and
// non-deterministic values) and generator failures on the rewrite.
import {readFileSync} from "node:fs";
const [slug, id, saved] = process.argv.slice(2);
if (!slug || !id) { console.error("usage: compare-variables.mjs <slug> <id> [legacy.json]"); process.exit(1); }
const LEGACY = process.env.LEGACY_URL ?? "http://localhost:3300";
const NEW = process.env.NEW_URL ?? "http://localhost:3301";
const legacy = saved ? JSON.parse(readFileSync(saved, "utf8")) : await (await fetch(`${LEGACY}/api/profile?slug=${slug}&id=${id}&locale=en`)).json();
const ours = await (await fetch(`${NEW}/api/debug/report?slug=${slug}&id=${id}&full=true`)).json();
const a = legacy.variables ?? {};
const b = ours.full?.variables ?? {};
const skip = /^(color|tesseract$|geoservice$|url$|user$|locale|showWhenPrinting|breadcrumbs$|_)/;
const norm = v => JSON.stringify(v, (k, x) => (typeof x === "number" ? Math.round(x * 1000) / 1000 : x));
let same = 0, differ = 0, missing = [], extra = [];
const diffs = [];
for (const key of Object.keys(a)) {
  if (skip.test(key)) continue;
  if (!(key in b)) { missing.push(key); continue; }
  if (norm(a[key]) === norm(b[key])) same++;
  else { differ++; diffs.push([key, norm(a[key]).slice(0, 120), norm(b[key]).slice(0, 120)]); }
}
for (const key of Object.keys(b)) if (!skip.test(key) && !(key in a)) extra.push(key);
console.log(`${slug}/${id}: ${same} identical, ${differ} different, ${missing.length} missing in rewrite, ${extra.length} only in rewrite`);
for (const [k, x, y] of diffs.slice(0, 40)) console.log(`  ≠ ${k}\n      legacy: ${x}\n      new:    ${y}`);
if (missing.length) console.log("  missing:", missing.slice(0, 40).join(", "));
if (extra.length) console.log("  extra:", extra.slice(0, 40).join(", "));
if (ours.generators?.failed?.length) console.log("  generator failures:", ours.generators.failed.map(g => `${g.id} ${g.name} (${g.status}) ${g.url?.slice(0, 80)}`).join("\n    "));
console.log(`  sections: ${ours.sections?.length ?? "?"} (legacy ${legacy.sections?.length ?? "?"})`);
