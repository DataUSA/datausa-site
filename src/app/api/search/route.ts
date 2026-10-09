/**
 * Sitewide search (replaces the legacy `/api/searchLegacy`). Query parameters: `q`, `dimension`,
 * `hierarchy`, `limit`. Returns members with the profile slug needed to build links.
 */
import {NextResponse} from "next/server";
import {getProfiles, memberTotals, searchMembers} from "@/lib/dimensions/db";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const dimension = searchParams.get("dimension") ?? undefined;
  const hierarchy = searchParams.get("hierarchy") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 10) || 10, 100);
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
  return NextResponse.json({results, query: {q, dimension, hierarchy, limit}, totals: memberTotals()}, {
    headers: {"Cache-Control": "public, max-age=300, stale-while-revalidate=3600"}
  });
}
