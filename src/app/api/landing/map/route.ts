/**
 * Data of a landing page's map (`?family=locations&level=counties[&state=massachusetts]`), in
 * columns: the members drawn, where each links to, and one column of values per measure.
 *
 * A level with a national shape file (states, counties, metro areas, districts, PUMAs) is drawn
 * member by member; inside one state so are places and school districts, from the state's own shape
 * file. Nationally those two, and universities, are drawn as states shaded by how many members each
 * has, linking to the state's page. Inside one state each university is a point (IPEDS gives where it
 * is), sized and shaded by its enrollment, over the state's outline.
 */
import {NextResponse} from "next/server";
import {landingFamily, landingStateBase, type LandingFamily, type LandingLevel, type LandingMeasure} from "@/content/landing/levels";
import {stateCounts, universityLocations} from "@/lib/dimensions/geo-db";
import {getUniversityFigures} from "@/lib/dimensions/universities";
import {buildLandingModel, shortName, stateBySlug, stateScope, type LandingScope} from "@/lib/landing/model";

interface Column {key: string; label: string; format: LandingMeasure["format"]; year: number | null; values: (number | null)[]}

export interface LandingMapData {
  /** Shape file under `/topojson/` (without `.json`). */
  topojson: string;
  /** Two-digit FIPS code of the state the map is limited to. */
  fips: string | null;
  /** What a member's slug is appended to for its link. */
  link: string;
  /** What a click on a shape opens, for the tooltip's footer: its report, the state's page, or nothing. */
  target: "report" | "state" | "none";
  /** Longitude and latitude of each member, when they are drawn as points over the state's shape. */
  points?: [number, number][];
  /** Where each member is, under its name in the tooltip ("Beverly, MA"). */
  places?: string[];
  /** Figures shown in the tooltip only. */
  details?: Column[];
  ids: string[];
  names: string[];
  slugs: string[];
  columns: Column[];
}

const json = (data: LandingMapData | {error: string}, complete: boolean, status = 200) => NextResponse.json(data, {
  status,
  // without figures (the data API is down) the response is not kept
  headers: {"Cache-Control": complete ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store"}
});

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const family = landingFamily(params.get("family") ?? "");
  const level = family?.levels.find(l => l.slug === params.get("level"));
  const stateSlug = params.get("state") ?? "";
  const scope = stateSlug ? stateScope(stateSlug) : undefined;
  if (!family || !level || (stateSlug && (!scope || !level.byState))) return json({error: "unknown level"}, false, 404);
  const isGeo = family.dimension === "Geography";

  // a map of states is of the whole level
  const model = await buildLandingModel(family, level, isGeo ? scope : undefined, !isGeo);
  const shapes = scope ? level.shapes ?? (level.stateShapes ? `${level.stateShapes}_${scope.state.fips}` : undefined) : level.shapes;

  if (isGeo && shapes) {
    return json({
      topojson: shapes,
      fips: scope?.state.fips ?? null,
      link: "/profile/geo/",
      target: "report",
      ids: model.rows.map(r => r.id),
      names: model.rows.map(r => scope ? shortName(r.name) : r.name),
      slugs: model.rows.map(r => r.slug),
      columns: model.measures.map(m => ({key: m.key, label: m.label, format: m.format, year: model.years[m.key], values: model.rows.map(r => r.values[m.key] ?? null)}))
    }, model.withData > 0);
  }
  if (scope && isGeo) return json({error: "no map for this level"}, false, 404);
  if (scope) return universityPoints(family, level, scope);

  // states shaded by their number of members
  const states = [...stateBySlug().values()];
  let counts: Map<string, number>;
  const totals = new Map<string, number>();
  const primary = model.primary;
  if (isGeo) {
    counts = stateCounts(level.hierarchy);
    for (const row of model.rows) {
      const value = row.values[primary.key];
      if (value !== undefined) totals.set(row.id.slice(7, 9), (totals.get(row.id.slice(7, 9)) ?? 0) + value);
    }
  }
  else {
    const figures = await getUniversityFigures();
    counts = new Map();
    for (const state of figures.states.values()) {
      counts.set(state.id.slice(7, 9), state.universities);
      totals.set(state.id.slice(7, 9), state.enrollment);
    }
  }
  const drawn = states.filter(s => counts.get(s.fips));
  return json({
    topojson: "State",
    fips: null,
    link: landingStateBase(family, level),
    target: "state",
    ids: drawn.map(s => s.id),
    names: drawn.map(s => s.name),
    slugs: drawn.map(s => s.slug),
    columns: [
      {key: "count", label: level.plural, format: "number", year: null, values: drawn.map(s => counts.get(s.fips) ?? null)},
      ...(primary.additive && totals.size ? [{key: primary.key, label: primary.label, format: primary.format, year: model.years[primary.key], values: drawn.map(s => totals.get(s.fips) ?? null)}] : [])
    ]
  }, drawn.length > 0);
}

/** The universities of one state as points, sized and shaded by enrollment, over the state's outline. */
async function universityPoints(family: LandingFamily, level: LandingLevel, scope: LandingScope) {
  // every figure: the tooltip shows endowment and acceptance rate as well
  const model = await buildLandingModel(family, level, scope);
  const where = universityLocations();
  // the largest first, so that the small ones are drawn over them
  const rows = model.rows
    .filter(r => where.has(r.id) && r.values.enrollment !== undefined)
    .sort((a, b) => (b.values.enrollment ?? 0) - (a.values.enrollment ?? 0));
  const column = (key: string): Column => {
    const m = model.measures.find(x => x.key === key)!;
    return {key: m.key, label: m.label, format: m.format, year: model.years[m.key] ?? null, values: rows.map(r => r.values[m.key] ?? null)};
  };
  return json({
    topojson: "State",
    fips: scope.state.fips,
    link: `/profile/${family.profile}/`,
    target: "report",
    points: rows.map(r => where.get(r.id)!.lonlat),
    places: rows.map(r => where.get(r.id)!.place ?? ""),
    ids: rows.map(r => r.id),
    names: rows.map(r => r.name),
    slugs: rows.map(r => r.slug || r.id),
    columns: [column("enrollment")],
    details: model.measures.filter(m => m.key !== "enrollment").map(m => column(m.key))
  }, rows.length > 0);
}
