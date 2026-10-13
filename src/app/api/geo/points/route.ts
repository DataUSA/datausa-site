/**
 * Every member of a geography level the search map draws as points (`?level=Place` or
 * `?level=School District`): id, name, position and, where the level has data, latest population.
 * The map clusters them in the browser, so it needs them all at once. Columns instead of one object
 * per member keep the 29,000 places to about a third of the size.
 */
import {NextResponse} from "next/server";
import {listMembers, schoolDistrictPoints} from "@/lib/dimensions/db";
import {getLevelPopulations, POPULATION_LEVELS} from "@/lib/dimensions/population";
import {SCHOOL_DISTRICT} from "@/lib/geo/levels";
import {placeCentroid} from "@/lib/geo/place-centroids";

type Point = [number, number];

const LEVELS: Record<string, () => (id: string) => Point | null | undefined> = {
  "Place": () => placeCentroid,
  [SCHOOL_DISTRICT]: () => { const points = schoolDistrictPoints(); return id => points.get(id); }
};

export async function GET(request: Request) {
  const level = new URL(request.url).searchParams.get("level") ?? "";
  if (!LEVELS[level]) return NextResponse.json({error: `level must be one of ${Object.keys(LEVELS).join(", ")}`}, {status: 400});
  const locate = LEVELS[level]();
  const populations = (POPULATION_LEVELS as readonly string[]).includes(level) ? await getLevelPopulations(level) : null;
  const ids: string[] = [], names: string[] = [], lon: number[] = [], lat: number[] = [], population: (number | null)[] = [];
  for (const m of listMembers("Geography", level, 1000000)) {
    const point = locate(m.id);
    if (!point) continue;
    ids.push(m.id);
    names.push(m.name);
    lon.push(point[0]);
    lat.push(point[1]);
    if (populations) population.push(populations.byId.get(m.id) ?? null);
  }
  // without figures (the data API is down) the response is not cached, as for the other levels
  const complete = ids.length > 0 && (!populations || populations.byId.size > 0);
  return NextResponse.json({level, year: populations?.year ?? null, ids, names, lon, lat, ...(populations?.byId.size ? {population} : {})}, {
    headers: {"Cache-Control": complete ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store"}
  });
}
