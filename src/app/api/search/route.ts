/**
 * Sitewide search (replaces the legacy `/api/searchLegacy`). Query parameters: `q`, `dimension`,
 * `hierarchy`, `limit`, `population=1`. Returns members with the profile slug needed to build links.
 * With `population=1` a list of universities also takes `rank` (enrollment, endowment or acceptance),
 * `order` (asc or desc, to turn the ranking round) and `state` (a state's geoid).
 */
import {NextResponse} from "next/server";
import {getProfiles, memberTotals, searchMembers} from "@/lib/dimensions/db";
import {searchReports} from "@/lib/search/reports";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const dimension = searchParams.get("dimension") ?? undefined;
  const hierarchy = searchParams.get("hierarchy") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 10) || 10, 100);
  const headers = {"Cache-Control": "public, max-age=300, stale-while-revalidate=3600"};
  // The search page asks for populations (and the population ranking of a single geography level);
  // the navigation search box does not need them.
  if (searchParams.get("population") === "1") {
    const rank = searchParams.get("rank") ?? undefined;
    const order = searchParams.get("order") ?? undefined;
    const state = searchParams.get("state") ?? undefined;
    const search = await searchReports(q, {dimension, hierarchy, limit, rank, order, state});
    return NextResponse.json({...search, query: {q, dimension, hierarchy, limit, rank, order, state}}, {headers});
  }
  const profiles = getProfiles();
  const slugByDimension = Object.fromEntries(profiles.filter(p => p.ordering === 0).map(p => [p.dimension, p.slug]));
  const results = searchMembers(q, {dimension, hierarchy, limit}).map(m => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    dimension: m.dimension,
    hierarchy: m.hierarchy,
    profile: slugByDimension[m.dimension],
    zvalue: m.zvalue,
    imageId: m.imageId
  }));
  return NextResponse.json({results, query: {q, dimension, hierarchy, limit}, totals: memberTotals()}, {headers});
}
