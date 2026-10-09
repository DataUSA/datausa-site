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
import type {FetchResult} from "@/lib/api/tesseract";
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
  if (path === "/api/neighbors") {
    const dimension = query.get("dimension");
    const id = query.get("id");
    if (dimension === "Geography" && id) {
      const limit = Number(query.get("limit") ?? 5);
      const members = await geoNeighbors(id);
      return ok(url, {data: members.slice(0, Math.max(limit, members.length)).map(memberJson)}, started);
    }
    return notFound(url, started, `neighbors for dimension ${dimension} not implemented`);
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
