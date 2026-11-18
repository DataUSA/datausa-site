/**
 * What a landing page shows, assembled from the dimensions database (who the members are) and the
 * level figures (`data.ts`): the rows of the level or of the level in one state, summary statistics,
 * rankings, and for geographies a distribution by size.
 */
import {MEASURES, pluralInSentence, type LandingFamily, type LandingLevel, type LandingMeasure, type MeasureKey} from "@/content/landing/levels";
import {parentLookup} from "@/lib/content/lookups";
import {getMembers} from "@/lib/dimensions/db";
import {levelLandAreas, levelMembers, stateMembers, type GeoMember} from "@/lib/dimensions/geo-db";
import {getUniversityFigures} from "@/lib/dimensions/universities";
import {districtLabel} from "@/lib/dimensions/district-labels";
import {change, getLevelData, type LevelFigures} from "./data";
import type {LandingScope} from "./scope";

export {shortName, stateById, stateBySlug, stateScope, type LandingScope} from "./scope";

export interface LandingRow {
  id: string;
  slug: string;
  name: string;
  /** Familiar name of a congressional district, or the state of a university. */
  note?: string;
  /** Figures by measure key; a member without one has no entry. */
  values: Record<string, number>;
  /** Change of the first measure from the earlier period (0.05 is +5%). */
  change?: number;
  landSqMi?: number;
  /** People per square mile of land. */
  density?: number;
  /** The member one level up that this one belongs to. */
  parent?: {id: string; slug: string; name: string};
}


export interface Ranking {
  /** Whether the first place is shared (medians at the survey's top code tie): no single member leads. */
  tied?: boolean;
  key: string;
  title: string;
  /** What the figure is, with its period ("2024 population"). */
  caption: string;
  format: LandingMeasure["format"] | "change";
  rows: {row: LandingRow; value: number}[];
}

export interface SizeClass {label: string; members: number; total: number}

export interface LandingModel {
  rows: LandingRow[];
  measures: LandingMeasure[];
  primary: LandingMeasure;
  /** Period of each measure's figures. */
  years: Record<string, number | null>;
  /** Period the change of the first measure is measured from. */
  changeFrom: number | null;
  /** Rows with a figure for the first measure. */
  withData: number;
  /** Sum of the first measure over the rows, when it adds up. */
  total: number | null;
  rankings: Ranking[];
  sizes: SizeClass[];
  /** Whether rows carry land area and density. */
  hasArea: boolean;
  /** Whether rows are grouped under a parent. */
  hasParents: boolean;
}

/** Members of a geography level in one state: the id says so, except for metro areas (not offered). */
function scopedMembers(level: LandingLevel, scope: LandingScope): GeoMember[] {
  return stateMembers(level.hierarchy, scope.state.fips);
}

/** Smallest first-measure figure a member needs to appear in a growth ranking: small members swing wildly. */
function growthFloor(values: number[]): number {
  if (values.length < 40) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length * 0.5)];
}

/** Population a geography needs to be ranked on a median or on growth. */
const GEO_FLOOR = 10000;

const POPULATION_CLASSES: [label: string, min: number][] = [
  ["Under 1,000", 0], ["1,000 to 10,000", 1e3], ["10,000 to 50,000", 1e4], ["50,000 to 100,000", 5e4],
  ["100,000 to 500,000", 1e5], ["500,000 to 1 million", 5e5], ["1 million and over", 1e6]
];

function sizeClasses(rows: LandingRow[], key: string): SizeClass[] {
  const classes = POPULATION_CLASSES.map(([label]) => ({label, members: 0, total: 0}));
  for (const row of rows) {
    const value = row.values[key];
    if (value === undefined) continue;
    let i = POPULATION_CLASSES.length - 1;
    while (i > 0 && value < POPULATION_CLASSES[i][1]) i--;
    classes[i].members++;
    classes[i].total += value;
  }
  // leave out the empty classes at either end (no state is under 1,000 people)
  let first = 0, last = classes.length - 1;
  while (first < last && !classes[first].members) first++;
  while (last > first && !classes[last].members) last--;
  return classes.slice(first, last + 1);
}

function top(rows: LandingRow[], value: (row: LandingRow) => number | undefined, ascending = false, limit = 10): {row: LandingRow; value: number}[] {
  return rows
    .map(row => ({row, value: value(row)}))
    .filter((d): d is {row: LandingRow; value: number} => d.value !== undefined)
    .sort((a, b) => ascending ? a.value - b.value : b.value - a.value)
    .slice(0, limit);
}

/** Parents of the members of a level, by member id (non-geography families). */
async function parentsOf(family: LandingFamily, level: LandingLevel, members: GeoMember[]): Promise<Map<string, {id: string; slug: string; name: string}>> {
  const out = new Map<string, {id: string; slug: string; name: string}>();
  if (!level.parent) return out;
  let lookup: Record<string, string[]> = {};
  try {
    lookup = await parentLookup(family.profile);
  }
  catch {
    return out;
  }
  // The level above, then the ones above that: the member tables do not list every member of every
  // level (an industry sub-sector that is its sector's only child appears as the sector alone).
  const above = family.levels.slice(0, family.levels.indexOf(level)).reverse().map(l => l.hierarchy);
  const found = new Map<string, {id: string; slug: string; name: string} | null>();
  const parent = (id: string, hierarchy: string) => {
    const key = `${hierarchy}|${id}`;
    if (!found.has(key)) {
      const m = getMembers(family.dimension, [id], hierarchy)[0];
      found.set(key, m && !m.hidden ? {id: m.id, slug: m.slug, name: m.name} : null);
    }
    return found.get(key);
  };
  for (const member of members) {
    // nearest ancestor first; some hierarchies repeat a member's own id one level up (a broad
    // occupation that is its minor group's only child)
    const candidates = [...(lookup[member.id] ?? []).slice().reverse(), member.id];
    search: for (const hierarchy of above) {
      for (const id of candidates) {
        const p = parent(id, hierarchy);
        if (p) { out.set(member.id, p); break search; }
      }
    }
  }
  return out;
}

/**
 * @param brief only the level's first measure (a hub lists each level's largest members and needs
 *   no more; a level has up to eight queries behind its full set)
 */
export async function buildLandingModel(family: LandingFamily, level: LandingLevel, scope?: LandingScope, brief = false): Promise<LandingModel> {
  const keys = brief ? level.measures.slice(0, 1) : level.measures;
  const measures: LandingMeasure[] = keys.map(key => MEASURES[key]);
  const primary = measures[0];
  const isGeo = family.dimension === "Geography";
  const isUniversity = level.hierarchy === "University";

  let members = scope && isGeo ? scopedMembers(level, scope) : levelMembers(family.dimension, level.hierarchy);
  const [data, universities, parents] = await Promise.all([
    getLevelData(level.hierarchy, keys),
    isUniversity ? getUniversityFigures() : undefined,
    isGeo || isUniversity || brief ? new Map<string, {id: string; slug: string; name: string}>() : parentsOf(family, level, members)
  ]);
  if (scope && isUniversity) members = members.filter(m => universities?.byId.get(m.id)?.state === scope.state.id);

  const areas = isGeo ? levelLandAreas(level.hierarchy) : new Map<string, number>();
  const first: LevelFigures = data[primary.key];
  const rows: LandingRow[] = members.map(m => {
    const values: Record<string, number> = {};
    for (const measure of measures) {
      const value = data[measure.key].values.get(m.id);
      if (value !== undefined) values[measure.key] = value;
    }
    const row: LandingRow = {id: m.id, slug: m.slug, name: m.name, values};
    const delta = change(first, m.id);
    if (delta !== undefined) row.change = delta;
    const land = areas.get(m.id);
    if (land) {
      row.landSqMi = land;
      if (values.population !== undefined) row.density = values.population / land;
    }
    if (level.hierarchy === "Congressional District") {
      const label = districtLabel(m.id);
      if (label) row.note = label;
    }
    if (isUniversity && !scope) {
      const state = universities?.byId.get(m.id)?.stateName;
      if (state) row.note = state;
    }
    const parent = parents.get(m.id);
    if (parent) row.parent = parent;
    return row;
  });

  const figures = rows.map(r => r.values[primary.key]).filter((v): v is number => v !== undefined);
  const years = Object.fromEntries(measures.map(m => [m.key, data[m.key].year]));
  const yearOf = (m: LandingMeasure) => years[m.key] ? `${years[m.key]} ` : "";

  // Small members make poor rankings: a median from a few dozen survey answers is noise (and often
  // the survey's top code), and a village that doubles is not the fastest-growing city. Geographies
  // are ranked on medians and on growth among those with at least 10,000 people where enough have
  // that many; other levels are ranked on growth among their larger half.
  const populous = figures.filter(v => v >= GEO_FLOOR).length;
  const geoFloor = isGeo && populous >= 10 && populous < figures.length ? GEO_FLOOR : 0;
  const halfFloor = geoFloor || growthFloor(figures);
  const atLeast = (floor: number) => (row: LandingRow) => (row.values[primary.key] ?? 0) >= floor;
  const among = (floor: number) => floor === geoFloor && floor > 0 ? `, among ${pluralInSentence(level)} with at least ${GEO_FLOOR.toLocaleString("en-US")} people`
    : floor > 0 ? `, among the larger half of ${pluralInSentence(level)}` : "";

  const rankings: Ranking[] = [];
  if (rows.length > 3) {
    for (const measure of measures) {
      const most = measure.ascending ? "Lowest" : measure.additive ? "Largest" : "Highest";
      const floor = measure.additive ? 0 : geoFloor;
      rankings.push({
        key: measure.key,
        title: measure.additive ? `${most} by ${measure.label}` : `${most} ${measure.label}`,
        caption: `${yearOf(measure)}${measure.phrase}${among(floor)}`,
        format: measure.format,
        rows: top(rows.filter(atLeast(floor)), r => r.values[measure.key], measure.ascending)
      });
    }
    if (first.previousYear !== null) {
      // large enough at both ends: a place redrawn from a hamlet into a town did not grow
      const was = (row: LandingRow) => row.change === undefined ? 0 : (row.values[primary.key] ?? 0) / (1 + row.change);
      const growing = top(rows.filter(atLeast(halfFloor)).filter(r => was(r) >= halfFloor), r => r.change);
      if (growing.length > 3) {
        rankings.splice(1, 0, {
          key: "change",
          title: `Fastest Growing ${primary.label}`,
          caption: `change in ${primary.phrase}, ${first.previousYear} to ${first.year}${among(halfFloor)}`,
          format: "change",
          rows: growing
        });
      }
    }
  }

  return {
    rows,
    measures,
    primary,
    years,
    changeFrom: first.previousYear,
    withData: figures.length,
    total: primary.additive && figures.length ? figures.reduce((a, b) => a + b, 0) : null,
    rankings: rankings.filter(r => r.rows.length > 0).map(r => ({...r, tied: r.rows.length > 1 && r.rows[0].value === r.rows[1].value})),
    sizes: isGeo && figures.length > 12 ? sizeClasses(rows, primary.key) : [],
    hasArea: rows.some(r => r.landSqMi !== undefined),
    hasParents: rows.some(r => r.parent)
  };
}

export type SortKey = string;

export interface TableView {
  sort: string;
  ascending: boolean;
  page: number;
  pages: number;
  rows: LandingRow[];
  /** Position of the first row in the sorted list, from 1. */
  start: number;
}

export const PAGE_SIZE = 100;

/** The columns a table of the model can be sorted by. */
export function sortKeys(model: LandingModel): string[] {
  const [first, ...rest] = model.measures.map(m => m.key);
  return ["name", first, ...(model.changeFrom !== null ? ["change"] : []), ...rest, ...(model.hasArea ? ["density", "area"] : [])];
}

const sortValue = (row: LandingRow, key: string): number | undefined =>
  key === "change" ? row.change : key === "density" ? row.density : key === "area" ? row.landSqMi : row.values[key];

/** One page of the level's rows in the order the address asks for (`?sort=income&dir=asc&page=2`). */
export function tableView(model: LandingModel, query: {sort?: string; dir?: string; page?: string}): TableView {
  const keys = sortKeys(model);
  const sort = query.sort && keys.includes(query.sort) ? query.sort : model.primary.key;
  const usual = sort === "name" || MEASURES[sort as MeasureKey]?.ascending === true;
  const ascending = query.dir === "asc" ? true : query.dir === "desc" ? false : usual;
  const sorted = [...model.rows].sort((a, b) => {
    if (sort === "name") return (ascending ? 1 : -1) * a.name.localeCompare(b.name);
    const va = sortValue(a, sort), vb = sortValue(b, sort);
    // members without the figure come last in either direction
    if (va === undefined || vb === undefined) return va === vb ? a.name.localeCompare(b.name) : va === undefined ? 1 : -1;
    return (ascending ? va - vb : vb - va) || a.name.localeCompare(b.name);
  });
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(query.page)) || 1));
  const start = (page - 1) * PAGE_SIZE;
  return {sort, ascending, page, pages, rows: sorted.slice(start, start + PAGE_SIZE), start: start + 1};
}
