/**
 * In-process replacements for the handful of legacy Express endpoints that report generators still
 * call by relative path (`/api/search`, `/api/neighbors`, `/api/civic/...`, `api/geo/similar/...`).
 *
 * Keeping the generator URLs intact preserves the extracted content verbatim; this module answers
 * them without HTTP, from the dimensions database and the public APIs. Anything not implemented
 * (notably the removed `/api/data` logic layer) yields a 404 result, which is also what production
 * returns today, so the dependent generators behave exactly as they do on the live site.
 */
import {civicOfficials, type CivicType} from "@/content/reports/geo/civic";
import napcs2sctg from "@/content/shared/data/nacps2sctg.json";
import {fetchData, TESSERACT_URL, type FetchResult} from "@/lib/api/tesseract";
import {sctgNames} from "@/lib/content/lookups";
import {getImage, getMember, getProfiles, getMembers, type MemberRow} from "@/lib/dimensions/db";
import {geoNeighbors, similarGeographies} from "@/lib/dimensions/similar";
import type {Variables} from "@/lib/reports/types";

export function isLegacyEndpoint(url: string): boolean {
  return /^\/?api\//.test(url);
}

function parse(url: string): {path: string; query: URLSearchParams} {
  const normalized = `/${url.replace(/^\/+/, "")}`;
  const u = new URL(normalized, "http://legacy.local");
  return {path: u.pathname.replace(/\/+$/, ""), query: u.searchParams};
}

function ok<T>(url: string, data: T, started: number): FetchResult<T> {
  return {url, data, status: 200, durationMs: performance.now() - started};
}

function notFound(url: string, started: number, reason: string): FetchResult<never> {
  return {url, data: null, status: 404, error: reason, durationMs: performance.now() - started};
}

function memberJson(m: MemberRow) {
  return {id: m.id, dimension: m.dimension, hierarchy: m.hierarchy, slug: m.slug, name: m.name, zvalue: m.zvalue, imageId: m.imageId, cubeName: m.cubeName};
}

/** Answers a legacy relative API URL. `attrs` are the current member attributes (unused for now). */
export async function fetchLegacyEndpoint(url: string, attrs: Variables): Promise<FetchResult<unknown>> {
  const started = performance.now();
  const {path, query} = parse(url);
  void attrs;

  // GET /api/search?id=<id>&dimension=<dimension>  (also slug=, pslug=, cubeName=, levels=)
  if (path === "/api/search") {
    const dimension = query.get("dimension") ?? undefined;
    const ids = (query.get("id") ?? "").split(",").filter(Boolean);
    const slugs = (query.get("slug") ?? "").split(",").filter(Boolean);
    const profiles = getProfiles();
    const slugByDimension = Object.fromEntries(profiles.filter(p => p.ordering === 0).map(p => [p.dimension, p.slug]));
    let rows: MemberRow[] = [];
    if (ids.length && dimension) rows = getMembers(dimension, ids);
    else if (slugs.length) {
      rows = profiles.flatMap(p => slugs.map(s => getMember(p.dimension, s)).filter((m): m is MemberRow => Boolean(m)));
    }
    const results = rows.filter(m => !m.hidden).map(m => {
      const image = m.imageId ? getImage(m.imageId) : undefined;
      const content = [{id: m.id, locale: "en", name: m.name, keywords: m.keywords, attr: null}];
      return {
        dimension: m.dimension, hierarchy: m.hierarchy, id: m.id, cubeName: m.cubeName, slug: m.slug,
        profile: slugByDimension[m.dimension], name: m.name, keywords: m.keywords, attr: null, content,
        image: image ? {id: image.id, url: image.url, author: image.author, license: image.license} : null
      };
    });
    return ok(url, {results, query: {dimension, id: query.get("id"), limit: Number(query.get("limit") ?? 10)}}, started);
  }

  // GET /api/neighbors?dimension=Geography&id=<id>
  // GET /api/neighbors?dimension=Occupation&hierarchy=<level>&id=<id>&measures=...&include=...&filters=...
  if (path === "/api/neighbors") {
    const dimension = query.get("dimension");
    const id = query.get("id");
    if (dimension === "Geography" && id) {
      const limit = Number(query.get("limit") ?? 5);
      const members = await geoNeighbors(id);
      return ok(url, {data: members.slice(0, Math.max(limit, members.length)).map(memberJson)}, started);
    }
    if ((dimension === "Occupation" || dimension === "PUMS Occupation") && id && query.get("hierarchy")) {
      return occupationNeighbors(url, id, query, started);
    }
    return notFound(url, started, `neighbors for dimension ${dimension} not implemented`);
  }

  // GET /api/university/(commonJobLookup|highestWageLookup|commonIndustryLookup)/:id/:hierarchy
  const university = path.match(/^\/api\/university\/(commonJobLookup|highestWageLookup|commonIndustryLookup)\/([^/]+)\/([^/]+)$/);
  if (university) {
    return universityLookup(url, university[1] as UniversityLookup, decodeURIComponent(university[2]), decodeURIComponent(university[3]), started);
  }

  // GET /api/napcs/:id/sctg
  const sctg = path.match(/^\/api\/napcs\/([^/]+)\/sctg$/);
  if (sctg) {
    const names = await sctgNames();
    const ids = (napcs2sctg as Record<string, string[]>)[decodeURIComponent(sctg[1])] ?? [];
    return ok(url, ids.map(d => names[d] || {id: d}), started);
  }

  // GET /api/civic/:type/:geo
  const civic = path.match(/^\/api\/civic\/(senator|representative)\/([^/]+)$/);
  if (civic) {
    const rows = await civicOfficials(civic[1] as CivicType, decodeURIComponent(civic[2]));
    return ok(url, rows, started);
  }

  // GET /api/geo/similar/:id
  const similar = path.match(/^\/api\/geo\/similar\/([^/]+)$/);
  if (similar) {
    const profile = getProfiles().find(p => p.slug === "geo");
    const member = profile ? getMember(profile.dimension, decodeURIComponent(similar[1]), profile.cubeName) : undefined;
    if (!member) return ok(url, {error: "Not a valid ID"}, started);
    const limit = Number(query.get("limit") ?? 6);
    const rows = await similarGeographies(member, limit);
    return ok(url, rows.map(memberJson), started);
  }

  // The logic-layer `/api/data` was removed from production; keep the same failure mode (404).
  return notFound(url, started, `legacy endpoint not available: ${path}`);
}


type Row = Record<string, string | number | null>;

/**
 * Occupations ranked by wage around the current one (legacy `/api/neighbors` for the occupation
 * dimension): the full PUMS ranking for the level, then a window of `limit` rows centred on the member.
 */
async function occupationNeighbors(url: string, id: string, query: URLSearchParams, started: number): Promise<FetchResult<unknown>> {
  const hierarchy = query.get("hierarchy") as string;
  const limit = Number(query.get("limit") ?? 5);
  let measure = query.get("measure") || query.get("measures") || "Average Wage";
  if (!measure.includes("Average Wage")) measure += ",Average Wage";
  const include = query.get("include");
  const filters = query.get("filters");
  const tesseractUrl = `${TESSERACT_URL}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,${encodeURIComponent(hierarchy)}&measures=${encodeURIComponent(measure)}&time=Year.latest&sort=Average+Wage.desc${include ? `&include=${include}` : ""}${filters ? `&filters=${filters}` : ""}`;
  const resp = await fetchData<{data: Row[]; source?: unknown}>(tesseractUrl);
  if (!resp.data) return {url, data: {error: resp.error ?? "no data"}, status: 200, durationMs: performance.now() - started};
  const first = measure.split(",")[0];
  const list = [...resp.data.data].sort((a, b) => Number(b[first]) - Number(a[first]));
  const index = list.findIndex(d => d[`${hierarchy} ID`] === id);
  let data: Row[];
  if (index <= limit / 2 + 1) data = list.slice(0, limit);
  else if (index > list.length - limit / 2 - 1) data = list.slice(-limit);
  else {
    const min = Math.ceil(index - limit / 2);
    data = list.slice(min, min + limit);
  }
  data = data.map(d => ({...d, Rank: list.indexOf(d) + 1}));
  return ok(url, {data, source: resp.data.source}, started);
}

type UniversityLookup = "commonJobLookup" | "highestWageLookup" | "commonIndustryLookup";

/** CIP2 codes present in IPEDS but absent from PUMS; excluded before querying PUMS (legacy note). */
const IPEDS_PUMS_EXCLUDED = [21, 29, 32, 33, 34, 35, 36, 37, 48, 53, 60];

/**
 * "Jobs/industries of graduates in the 5 most specialised majors" (legacy
 * `/api/university/{commonJobLookup,highestWageLookup,commonIndustryLookup}`): finds the five
 * CIP2 majors with the highest completions RCA for the institution, then queries PUMS for the
 * occupations or industries of people holding those degrees, folding duplicates together.
 */
async function universityLookup(url: string, kind: UniversityLookup, id: string, hierarchy: string, started: number): Promise<FetchResult<unknown>> {
  const latest = await fetchData<{data: Row[]}>(`${TESSERACT_URL}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${encodeURIComponent(hierarchy)}:${encodeURIComponent(id)}&locale=en&measures=Completions&time=Year.latest`);
  const latestYear = latest.data?.data?.[0]?.Year;
  if (latestYear === undefined) return notFound(url, started, "no completions for this institution");
  const rca = await fetchData<{data: Row[]}>(`${TESSERACT_URL}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=${encodeURIComponent(hierarchy)}&activity=CIP2&measure=Completions&time=Year&filter=${encodeURIComponent(hierarchy)}:${encodeURIComponent(id)}&cuts=Year:${latestYear}`);
  const cip2 = [...(rca.data?.data ?? [])]
    .sort((a, b) => Number(b["Completions RCA"]) - Number(a["Completions RCA"]))
    .filter(d => !IPEDS_PUMS_EXCLUDED.includes(Number(d["CIP2 ID"])))
    .slice(0, 5)
    .map(d => String(d["CIP2 ID"]).padStart(2, "0"))
    .join(",");
  if (!cip2) return ok(url, {data: []}, started);
  const drilldown = kind === "commonIndustryLookup" ? "Industry+Group" : "Detailed+Occupation";
  const measures = kind === "highestWageLookup" ? "Record+Count,Average+Wage" : "Record+Count,Total+Population";
  const sort = kind === "highestWageLookup" ? "Average+Wage.desc" : "Total+Population.desc";
  const pums = await fetchData<{data: Row[]}>(`${TESSERACT_URL}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,CIP2,${drilldown}&include=Workforce+Status:true;Employment+Time+Status:1;CIP2:${cip2}&locale=en&measures=${measures}&time=Year.latest&filters=Record+Count.gte.5&sort=${sort}`);
  let rows = pums.data?.data ?? [];
  if (kind === "highestWageLookup") {
    rows = [...rows].sort((a, b) => Number(b["Average Wage"]) - Number(a["Average Wage"]));
    const deduped: Row[] = [];
    rows.forEach(d => {
      if (deduped.length < 5 && !deduped.find(w => w["Detailed Occupation"] === d["Detailed Occupation"])) deduped.push(d);
    });
    deduped.sort((a, b) => Number(b["Average Wage"]) - Number(a["Average Wage"]));
    return ok(url, {data: deduped.slice(0, 10)}, started);
  }
  const key = kind === "commonIndustryLookup" ? "Industry Group" : "Detailed Occupation";
  if (kind === "commonIndustryLookup") rows = rows.filter(d => d["Industry Group ID"] !== "");
  const deduped: Row[] = [];
  rows.forEach(d => {
    const existing = deduped.find(j => j[key] === d[key]);
    if (existing) existing["Total Population"] = Number(existing["Total Population"]) + Number(d["Total Population"]);
    else deduped.push({...d});
  });
  deduped.sort((a, b) => Number(b["Total Population"]) - Number(a["Total Population"]));
  return ok(url, {data: deduped.slice(0, 10)}, started);
}
