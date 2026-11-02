// Checks that a report rendered through the generator cache has exactly the variables of an
// uncached render: for each report, renders it once without the cache (`cache=bypass` on the
// diagnostics route), then twice through it (the first computes and stores, the second reads the
// stored outputs), and diffs both against the uncached variables.
//
//   node scripts/cache/compare-cached.mjs [base=http://localhost:3301] [states=52] [counties=10] [skip=0]
// (`skip` drops the first reports of the list, to split a long check into shorter runs)
import {readFileSync} from "node:fs";
import {isDeepStrictEqual} from "node:util";

const [base = "http://localhost:3301", stateCount = "52", countyCount = "10", skip = "0"] = process.argv.slice(2);
const members = readFileSync(new URL("../../data/members.jsonl", import.meta.url), "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line));
const pick = (hierarchy, n) => members.filter(m => m.dimension === "Geography" && m.hierarchy === hierarchy)
  .sort((a, b) => (b.zvalue ?? 0) - (a.zvalue ?? 0)).slice(0, Number(n)).map(m => m.slug);
const slugs = [...pick("State", stateCount), ...pick("County", countyCount)].slice(Number(skip));

const render = async (slug, extra = "") => {
  const res = await fetch(`${base}/api/debug/report?slug=geo&id=${slug}&full=true${extra}`);
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
  return res.json();
};

/** Differences of `other` from `uncached`; "noise" are float sums that differ in the last digits. */
function compare(uncached, other) {
  const a = uncached.full.variables;
  const b = other.full.variables;
  const diffs = [];
  const noise = [];
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (isDeepStrictEqual(a[key], b[key])) continue;
    // Tesseract's float sums can change in the last digits between two answers (aggregation order),
    // also without any cache: reported apart, not counted as a difference
    if (typeof a[key] === "number" && typeof b[key] === "number" && Math.abs(a[key] - b[key]) <= 1e-9 * Math.max(1, Math.abs(a[key]))) noise.push(key);
    else diffs.push(key);
  }
  const ids = r => r.generators.failed.map(g => g.id).sort();
  const sameOrder = isDeepStrictEqual(Object.keys(a), Object.keys(b));
  const sameFailures = isDeepStrictEqual(ids(uncached), ids(other));
  const ok = !diffs.length && sameOrder && sameFailures;
  const text = `${other.cache?.summary ?? "no cache"}${diffs.length ? `; differ: ${diffs.slice(0, 10).join(", ")}${diffs.length > 10 ? ` (+${diffs.length - 10})` : ""}` : ""}${noise.length ? `; float noise: ${noise.join(", ")}` : ""}${sameOrder ? "" : "; key order differs"}${sameFailures ? "" : `; failures ${ids(uncached)} vs ${ids(other)}`}`;
  return {ok, text};
}

let differing = 0;
for (const slug of slugs) {
  const uncached = await render(slug, "&cache=bypass");
  const filled = compare(uncached, await render(slug));
  const cached = compare(uncached, await render(slug));
  const ok = filled.ok && cached.ok;
  if (!ok) differing++;
  console.log(`${ok ? "same" : "DIFF"} ${slug}: ${Object.keys(uncached.full.variables).length} variables; computing render: ${filled.text}; cached render: ${cached.text}`);
}
console.log(`${slugs.length - differing}/${slugs.length} reports identical`);
process.exit(differing ? 1 : 0);
