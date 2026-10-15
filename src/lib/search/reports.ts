/**
 * Search behind the search page: the member search of the dimensions database, with the latest
 * population attached to geographies.
 *
 * Ranking. Browsing one geography level (a level filter and no text) lists its members by
 * population, largest first, those without a figure last. Everything else keeps the relevance and
 * popularity (z-value) order of `searchMembers`: populations are not comparable across report types,
 * and across geography levels they would simply list every state before the first city. A level
 * without data (school districts) has neither figure and is browsed in name order.
 *
 * Universities. Browsing them lists the universities by an IPEDS figure: enrollment unless another
 * ranking is asked for (`rank`, in its usual order unless `order` turns it round), optionally within one state (`state`, where typed text narrows the
 * state's list by name instead of searching everything). Carnegie classifications, which are groups
 * of universities, are not part of a ranking; they stay under their own filters and in text search.
 */
import {getProfiles, getSchoolDistrict, listMembers, sanitizeQuery, searchMembers, type MemberRow} from "@/lib/dimensions/db";
import {getLevelPopulations, POPULATION_LEVELS, type LevelPopulations} from "@/lib/dimensions/population";
import {DEFAULT_UNIVERSITY_RANKING, getUniversityFigures, isUniversityRanking, UNIVERSITY_RANKINGS, type UniversityFigures, type UniversityRanking} from "@/lib/dimensions/universities";
import {districtLabel} from "@/lib/dimensions/district-labels";
import {SCHOOL_DISTRICT} from "@/lib/geo/levels";
import {placeCentroid} from "@/lib/geo/place-centroids";

export interface ReportSearchResult {
  id: string;
  slug: string;
  name: string;
  dimension: string;
  hierarchy: string;
  profile: string;
  /** Latest ACS population; null when the cube has no figure; absent for non-geographies. */
  population?: number | null;
  /** Familiar name of a congressional district ("Appalachian Kentucky"). */
  label?: string;
  /** `[longitude, latitude]`, for places and school districts when their level is selected (drawn as points). */
  lonlat?: [number, number];
  /** A university's figure in the ranking of the list (null: none reported). */
  value?: number | null;
  /** State a university is in. */
  state?: string;
}

/** The figure a list of universities shows and, when browsed, is ordered by. */
export interface ReportSearchMetric {
  key: UniversityRanking;
  label: string;
  year: number | null;
  /** Whether the list runs from the lowest figure up. */
  ascending: boolean;
}

export interface ReportSearch {
  results: ReportSearchResult[];
  ranking: "population" | "relevance" | UniversityRanking;
  /** ACS vintage of the population figures, when any were attached. */
  populationYear: number | null;
  /** Set when the results carry a university figure (`value`). */
  metric: ReportSearchMetric | null;
  /** Geoid of the state the universities were limited to. */
  state: string | null;
}

export interface ReportSearchOptions {
  dimension?: string;
  hierarchy?: string;
  limit?: number;
  /** Ranking of a university list (`UNIVERSITY_RANKINGS`). */
  rank?: string;
  /** "asc" or "desc", to turn a ranking round; anything else keeps the ranking's usual order. */
  order?: string;
  /** Geoid of a state, to list its universities only. */
  state?: string;
}

/** Whether this filter lists universities, which can be ranked and limited to a state. */
export function isUniversityList(dimension?: string, hierarchy?: string): boolean {
  return dimension === "University" && (!hierarchy || hierarchy === "University");
}

const LEVELS = new Set<string>(POPULATION_LEVELS);

/** Whether this filter selects exactly one geography level that has population figures. */
export function isPopulationLevel(dimension?: string, hierarchy?: string): boolean {
  return dimension === "Geography" && Boolean(hierarchy) && LEVELS.has(hierarchy as string);
}

/** Levels the search map draws as points: there are too many members to draw every shape. */
const POINT_LEVELS: Record<string, (id: string) => [number, number] | null | undefined> = {
  "Place": placeCentroid,
  [SCHOOL_DISTRICT]: id => getSchoolDistrict(id)?.lonlat
};

const isNonVoting = (m: MemberRow) => m.hierarchy === "Congressional District" && m.id.endsWith("98");

// Members of a level sorted by population, kept as long as the population lookup they were sorted with.
const ranked = new WeakMap<LevelPopulations, Map<string, MemberRow[]>>();

function rankedMembers(level: string, populations: LevelPopulations): MemberRow[] {
  let byLevel = ranked.get(populations);
  if (!byLevel) ranked.set(populations, byLevel = new Map());
  let members = byLevel.get(level);
  if (!members) {
    const pop = (m: MemberRow) => populations.byId.get(m.id);
    members = listMembers("Geography", level, 1000000).sort((a, b) => {
      // Delegates and the resident commissioner (district "98": DC, Puerto Rico, the territories)
      // have no vote in the House, so they follow the voting districts instead of Puerto Rico's
      // 3.2 million leading the list.
      const pa = pop(a), pb = pop(b);
      const na = isNonVoting(a) && pa !== undefined, nb = isNonVoting(b) && pb !== undefined;
      if (na !== nb && pa !== undefined && pb !== undefined) return na ? 1 : -1;
      if (pa === undefined || pb === undefined) return pa === pb ? (b.zvalue ?? 0) - (a.zvalue ?? 0) : pa === undefined ? 1 : -1;
      return pb - pa || (b.zvalue ?? 0) - (a.zvalue ?? 0);
    });
    byLevel.set(level, members);
  }
  return members;
}

// Universities in the order of a ranking, kept as long as the figures they were sorted with.
const rankedUniversities = new WeakMap<UniversityFigures, Map<string, MemberRow[]>>();

function universitiesBy(ranking: UniversityRanking, ascending: boolean, figures: UniversityFigures): MemberRow[] {
  let byRanking = rankedUniversities.get(figures);
  if (!byRanking) rankedUniversities.set(figures, byRanking = new Map());
  const key = `${ranking} ${ascending ? "asc" : "desc"}`;
  let members = byRanking.get(key);
  if (!members) {
    const direction = ascending ? 1 : -1;
    const value = (m: MemberRow) => figures.byId.get(m.id)?.[ranking];
    // universities without the figure follow the ranked ones in either order, by popularity
    members = listMembers("University", "University", 1000000).sort((a, b) => {
      const va = value(a), vb = value(b);
      if (va === undefined || vb === undefined) return va === vb ? (b.zvalue ?? 0) - (a.zvalue ?? 0) : va === undefined ? 1 : -1;
      return direction * (va - vb) || (b.zvalue ?? 0) - (a.zvalue ?? 0);
    });
    byRanking.set(key, members);
  }
  return members;
}

export async function searchReports(query: string, {dimension, hierarchy, limit = 10, rank, order, state}: ReportSearchOptions = {}): Promise<ReportSearch> {
  const slugByDimension = Object.fromEntries(getProfiles().filter(p => p.ordering === 0).map(p => [p.dimension, p.slug]));
  const oneLevel = isPopulationLevel(dimension, hierarchy);
  const text = sanitizeQuery(query);
  const browsing = oneLevel && !text;

  // without figures (the data API is down) universities fall back to the popularity order
  const loaded = isUniversityList(dimension, hierarchy) ? await getUniversityFigures() : null;
  const figures = loaded?.byId.size ? loaded : null;
  const ranking = figures ? isUniversityRanking(rank) ? rank : DEFAULT_UNIVERSITY_RANKING : null;
  const ascending = ranking ? order === "asc" || order === "desc" ? order === "asc" : UNIVERSITY_RANKINGS[ranking].ascending : false;
  const inState = figures && state && figures.states.has(state) ? state : null;
  let byFigure = false;

  let members: MemberRow[];
  const lookups = new Map<string, LevelPopulations>();
  if (figures && ranking && (inState || !text)) {
    const terms = text.split(" ").filter(Boolean);
    members = [];
    for (const m of universitiesBy(ranking, ascending, figures)) {
      if (inState && figures.byId.get(m.id)?.state !== inState) continue;
      if (terms.length) {
        const name = ` ${sanitizeQuery(`${m.name} ${m.keywords.join(" ")}`)}`;
        if (!terms.every(term => name.includes(` ${term}`))) continue;
      }
      members.push(m);
      if (members.length >= limit) break;
    }
    byFigure = true;
  }
  else if (browsing) {
    const populations = await getLevelPopulations(hierarchy as string);
    lookups.set(hierarchy as string, populations);
    // without figures (the data API is down) the list falls back to the popularity order
    members = populations.byId.size ? rankedMembers(hierarchy as string, populations).slice(0, limit) : searchMembers("", {dimension, hierarchy, limit});
  }
  else {
    members = searchMembers(query, {dimension, hierarchy, limit});
    const levels = Array.from(new Set(members.filter(m => m.dimension === "Geography" && LEVELS.has(m.hierarchy)).map(m => m.hierarchy)));
    await Promise.all(levels.map(async level => { lookups.set(level, await getLevelPopulations(level)); }));
  }

  let populationYear: number | null = null;
  const results = members.map(m => {
    const result: ReportSearchResult = {id: m.id, slug: m.slug, name: m.name, dimension: m.dimension, hierarchy: m.hierarchy, profile: slugByDimension[m.dimension] ?? "geo"};
    const lookup = m.dimension === "Geography" ? lookups.get(m.hierarchy) : undefined;
    if (lookup?.byId.size) {
      result.population = lookup.byId.get(m.id) ?? null;
      populationYear ??= lookup.year;
    }
    if (m.hierarchy === "Congressional District") {
      const label = districtLabel(m.id);
      if (label) result.label = label;
    }
    if (dimension === "Geography" && hierarchy === m.hierarchy && POINT_LEVELS[m.hierarchy]) {
      const lonlat = POINT_LEVELS[m.hierarchy](m.id);
      if (lonlat) result.lonlat = lonlat;
    }
    if (figures && ranking && m.dimension === "University" && m.hierarchy === "University") {
      const figure = figures.byId.get(m.id);
      result.value = figure?.[ranking] ?? null;
      if (figure?.stateName) result.state = figure.stateName;
    }
    return result;
  });
  return {
    results,
    ranking: byFigure && ranking ? ranking : browsing && lookups.get(hierarchy as string)?.byId.size ? "population" : "relevance",
    populationYear,
    metric: figures && ranking ? {key: ranking, label: UNIVERSITY_RANKINGS[ranking].label, year: figures.years[ranking], ascending} : null,
    state: inState
  };
}
