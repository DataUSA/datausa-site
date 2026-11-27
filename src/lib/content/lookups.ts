/**
 * Small lookup tables the legacy server built at boot from Tesseract (`cache/*.js`) and that the
 * attribute resolvers of the non-geography report families read. Each is a cached fetch (the `data`
 * cache-life profile, `tesseract` tag) so a release purge refreshes them with everything else.
 *
 * Only complete tables are cached. The explicit `cacheLife("data")` of a lookup overrides the
 * shorter life `fetchData` gives a failed request (`cacheLife` docs, "Nested caching behavior"), so
 * a lookup built while Tesseract failed would be served, empty, for days. Each cached lookup
 * therefore throws when any of its requests failed (an entry that throws is not stored), and the
 * exported function then builds the table without the cache, for this request only.
 */
import {cacheLife, cacheTag} from "next/cache";
import {fetchData, TESSERACT_URL} from "@/lib/api/tesseract";
import {withUpstreamScope} from "@/lib/api/upstream-scope";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisConfigured} from "@/lib/cache/redis";
import {cachedValue} from "@/lib/cache/values";

/** Runs `compute` and throws if any upstream request inside it failed (for use inside `use cache`). */
async function completeOnly<T>(compute: () => Promise<T>): Promise<T> {
  const {value, scope} = await withUpstreamScope(compute);
  if (scope.failures.length) throw new Error(`incomplete lookup, not cached: ${scope.failures[0]}`);
  return value;
}

/**
 * The cached table, or when it could not be built completely, an uncached (degraded) one. With
 * Redis the table lives in the shared store instead (same rule: only complete tables are stored),
 * tagged with the cubes it reads.
 */
async function orUncached<T>(cached: () => Promise<T>, compute: () => Promise<T>, name: string): Promise<T> {
  const version = redisConfigured() ? generatorManifest()?.lookups : undefined;
  // no host in the key: a table holds data, whichever API host it was read from (see `hostFree`)
  if (version) return cachedValue(`lookup:${name}:${version}`, `lookup|${name}`, compute);
  try {
    return await cached();
  }
  catch {
    return compute();
  }
}

type Rows = {data: Record<string, string | number | null>[]};
type Members = {members: {key: string | number; caption: string; ancestor?: {key: string | number}[]}[]};

/** PUMS industry id (without the leading "31-33"-style prefix zeros) → BLS monthly industry id. */
export async function blsMonthlyIndustries(): Promise<Record<string, string>> {
  return orUncached(cachedBlsMonthlyIndustries, computeBlsMonthlyIndustries, "blsMonthlyIndustries");
}

async function cachedBlsMonthlyIndustries(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  return completeOnly(computeBlsMonthlyIndustries);
}

async function computeBlsMonthlyIndustries(): Promise<Record<string, string>> {
  const result = await fetchData<Rows>(`${TESSERACT_URL}tesseract/data.jsonrecords?cube=BLS+Employment+-+Industry+Only&drilldowns=Industry&measures=NSA+Employees`);
  const out: Record<string, string> = {};
  for (const d of result.data?.data ?? []) {
    const id = String(d["Industry ID"]);
    out[id.slice(2).replace(/0+$/, "")] = id;
  }
  return out;
}

/** University id → OPEID6. */
export async function universityOpeids(): Promise<Record<string, string>> {
  return orUncached(cachedUniversityOpeids, computeUniversityOpeids, "universityOpeids");
}

async function cachedUniversityOpeids(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  return completeOnly(computeUniversityOpeids);
}

async function computeUniversityOpeids(): Promise<Record<string, string>> {
  const result = await fetchData<Rows>(`${TESSERACT_URL}tesseract/data.jsonrecords?cube=university_cube&drilldowns=University,OPEID6&locale=en&measures=Count`);
  const out: Record<string, string> = {};
  for (const d of result.data?.data ?? []) out[String(d["University ID"])] = String(d.OPEID6 ?? "");
  return out;
}

/** University id → website URL (the `url` attribute shown in the hero). */
export async function universityUrls(): Promise<Record<string, string>> {
  return orUncached(cachedUniversityUrls, computeUniversityUrls, "universityUrls");
}

async function cachedUniversityUrls(): Promise<Record<string, string>> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  return completeOnly(computeUniversityUrls);
}

async function computeUniversityUrls(): Promise<Record<string, string>> {
  const result = await fetchData<Rows>(`${TESSERACT_URL}tesseract/data.jsonrecords?cube=university_cube&drilldowns=University,URL&locale=en&measures=Count`);
  const out: Record<string, string> = {};
  for (const d of result.data?.data ?? []) if (d.URL) out[String(d["University ID"])] = String(d.URL);
  return out;
}

/** SCTG2 commodity id → {id, name} (freight product names for NAPCS reports). */
export async function sctgNames(): Promise<Record<string, {id: string; name: string}>> {
  return orUncached(cachedSctgNames, computeSctgNames, "sctgNames");
}

async function cachedSctgNames(): Promise<Record<string, {id: string; name: string}>> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  return completeOnly(computeSctgNames);
}

async function computeSctgNames(): Promise<Record<string, {id: string; name: string}>> {
  const result = await fetchData<Members>(`${TESSERACT_URL}tesseract/members?cube=dot_faf&level=SCTG2`);
  const out: Record<string, {id: string; name: string}> = {};
  for (const m of result.data?.members ?? []) out[String(m.key)] = {id: String(m.key), name: m.caption};
  return out;
}

/** The Tesseract member levels, per report family, whose `ancestor` lists give report breadcrumbs. */
const PARENT_LEVELS: Record<string, {cube: string; levels: string[]}> = {
  naics: {cube: "pums_5", levels: ["Industry Sector", "Industry Sub-Sector", "Industry Group"]},
  soc: {cube: "pums_5", levels: ["Major Occupation Group", "Minor Occupation Group", "Broad Occupation", "Detailed Occupation"]},
  university: {cube: "ipeds_completions", levels: ["Carnegie Parent", "Carnegie", "University"]},
  cip: {cube: "ipeds_completions", levels: ["CIP2", "CIP4", "CIP6"]},
  napcs: {cube: "usa_spending", levels: ["NAPCS Section", "NAPCS Group", "NAPCS Class"]}
};

/** CIP codes lose their leading zero in Tesseract; restore it (legacy `parseFlatParents`). */
function padCip(key: string): string {
  return /^\d$/.test(key) || /^\d{3}$/.test(key) || /^\d{5}$/.test(key) ? `0${key}` : key;
}

/** Member id → ancestor ids for one report family (legacy `cache/parents.js`). */
export async function parentLookup(profileSlug: string): Promise<Record<string, string[]>> {
  return orUncached(() => cachedParentLookup(profileSlug), () => computeParentLookup(profileSlug), `parents:${profileSlug}`);
}

async function cachedParentLookup(profileSlug: string): Promise<Record<string, string[]>> {
  "use cache";
  cacheLife("data");
  cacheTag("tesseract");
  return completeOnly(() => computeParentLookup(profileSlug));
}

async function computeParentLookup(profileSlug: string): Promise<Record<string, string[]>> {
  const spec = PARENT_LEVELS[profileSlug];
  if (!spec) return {};
  const isCip = profileSlug === "cip";
  const out: Record<string, string[]> = {};
  const responses = await Promise.all(spec.levels.map(level =>
    fetchData<Members>(`${TESSERACT_URL}tesseract/members?cube=${spec.cube}&level=${encodeURIComponent(level)}&parents=true`)));
  for (const result of responses) {
    for (const member of result.data?.members ?? []) {
      const key = isCip ? padCip(String(member.key)) : String(member.key);
      const parents = Array.from(new Set((member.ancestor ?? []).map(a => isCip ? padCip(String(a.key)) : String(a.key)).filter(k => k !== key)));
      out[key] = parents;
    }
  }
  return out;
}
