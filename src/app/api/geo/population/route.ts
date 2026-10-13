/**
 * Latest population of every report geography of one level (`?level=County`), for the search page
 * map. Places are not served here: the map draws them as points, from `/api/geo/points`.
 */
import {NextResponse} from "next/server";
import {listMembers} from "@/lib/dimensions/db";
import {districtLabel} from "@/lib/dimensions/district-labels";
import {getLevelPopulations, POPULATION_LEVELS} from "@/lib/dimensions/population";

const MAP_LEVELS = POPULATION_LEVELS.filter(level => level !== "Place") as string[];

export async function GET(request: Request) {
  const level = new URL(request.url).searchParams.get("level") ?? "";
  if (!MAP_LEVELS.includes(level)) return NextResponse.json({error: `level must be one of ${MAP_LEVELS.join(", ")}`}, {status: 400});
  const populations = await getLevelPopulations(level);
  const data = listMembers("Geography", level, 100000)
    .map(m => ({id: m.id, name: m.name, population: populations.byId.get(m.id) ?? null, ...(level === "Congressional District" && districtLabel(m.id) ? {label: districtLabel(m.id)} : {})}))
    .filter(d => d.population !== null);
  return NextResponse.json({level, year: populations.year, data}, {
    headers: {"Cache-Control": data.length ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store"}
  });
}
