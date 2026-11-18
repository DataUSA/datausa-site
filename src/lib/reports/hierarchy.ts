/**
 * Where a report's member sits in its hierarchy: what it is part of, what it contains and how it
 * ranks among its peers. Shown at the top of the report (the hero's context line and the "in
 * context" section under it).
 *
 * Everything comes from the dimensions database (`geo-db.ts`: states by id, counties and metro
 * areas through the build-time containment table) and from the level figures the landing pages
 * read (`src/lib/landing/data.ts`: one cached query per level, shared by every report). A report
 * therefore sends no query of its own for this, and when the figures are unavailable the lists are
 * in name order without numbers.
 */
import {landingLevel, landingPath, levelLandingPath, MEASURES, pluralInSentence, type LandingMeasure} from "@/content/landing/levels";
import {parentLookup} from "@/lib/content/lookups";
import {getMembers, type MemberRow} from "@/lib/dimensions/db";
import {containedMembers, containers, geoFacts, levelMembers, stateMembers, type GeoMember} from "@/lib/dimensions/geo-db";
import {getLevelFigures, type LevelFigures} from "@/lib/landing/data";
import {shortName, stateById} from "@/lib/landing/scope";

export interface HierarchyLink {name: string; href: string}

export interface HierarchyChild extends HierarchyLink {
  id: string;
  /** The member's figure on the group's measure. */
  value?: number;
}

export interface HierarchyGroup {
  /** Level of the members ("Place"). */
  hierarchy: string;
  /** Heading ("Cities & Places"). */
  label: string;
  total: number;
  /** Largest first where there are figures, else by name. */
  children: HierarchyChild[];
  measure?: {label: string; format: LandingMeasure["format"]; year: number | null};
  /** The landing page that lists them all with their figures, when there is one. */
  more?: HierarchyLink;
}

export interface HierarchyRank {
  /** Position among the peers, from 1. */
  rank: number;
  of: number;
  /** What it is ranked on ("population"). */
  by: string;
  /** The peers ("counties in Massachusetts"), linked to their landing page. */
  among: string;
  href?: string;
}

export interface ReportHierarchy {
  /** One member of the level ("County"), linked to the level's landing page. */
  level?: HierarchyLink;
  /** What the member is part of, nearest first ("Massachusetts", "United States"). */
  parents: HierarchyLink[];
  /** The metropolitan area it belongs to, which is not a step between county and state. */
  metro?: HierarchyLink;
  ranks: HierarchyRank[];
  landSqMi?: number;
  /** People per square mile of land. */
  density?: number;
  groups: HierarchyGroup[];
}

/** How many children a group lists before the rest are left to the landing page (or folded away). */
export const CHILD_LIMIT = 150;

const SINGULAR: Record<string, string> = {
  "Nation": "Nation", "State": "State", "County": "County", "Place": "City or Place", "MSA": "Metropolitan Area", "PUMA": "PUMA",
  "Congressional District": "Congressional District", "School District": "School District",
  "CIP2": "Field of Study", "CIP4": "Major", "CIP6": "Degree Program", "University": "College or University",
  "Carnegie": "Carnegie Classification", "Carnegie Parent": "Carnegie Classification Group"
};

const NEAREST_FIRST = ["County", "State", "Nation", "MSA"];

function rankOf(id: string, peers: {id: string}[], figures: LevelFigures): {rank: number; of: number} | undefined {
  const value = figures.values.get(id);
  if (value === undefined) return undefined;
  let rank = 1, of = 0;
  for (const peer of peers) {
    const v = figures.values.get(peer.id);
    if (v === undefined) continue;
    of++;
    if (v > value) rank++;
  }
  return of > 1 ? {rank, of} : undefined;
}

function group(profile: string, hierarchy: string, members: GeoMember[], figures: LevelFigures | undefined, measure: LandingMeasure | undefined, strip: boolean, more?: HierarchyLink): HierarchyGroup | undefined {
  if (!members.length) return undefined;
  const found = profile === "geo" ? landingLevel("Geography", hierarchy) : undefined;
  const children: HierarchyChild[] = members.map(m => ({id: m.id, name: strip ? shortName(m.name) : m.name, href: `/profile/${profile}/${m.slug || m.id}`, value: figures?.values.get(m.id)}));
  const hasFigures = children.some(c => c.value !== undefined);
  children.sort((a, b) => (b.value ?? -1) - (a.value ?? -1) || a.name.localeCompare(b.name));
  return {
    hierarchy,
    label: found?.level.plural ?? hierarchy,
    total: children.length,
    children: children.slice(0, CHILD_LIMIT),
    ...(hasFigures && measure && figures ? {measure: {label: measure.label, format: measure.format, year: figures.year}} : {}),
    ...(more ? {more} : {})
  };
}

async function geoHierarchy(member: MemberRow, breadcrumbs: {id: string; slug: string; name: string; hierarchy?: string}[]): Promise<ReportHierarchy> {
  const {id, hierarchy} = member;
  const fips = /^\d{2}$/.test(id.slice(7, 9)) && hierarchy !== "MSA" && hierarchy !== "Nation" ? id.slice(7, 9) : "";
  const state = hierarchy === "State" ? undefined : fips ? stateById(`04000US${fips}`) : undefined;
  const population = (level: string) => getLevelFigures(level, "population");
  const measure = MEASURES.population;

  // what it is part of: the county and metro area that contain it, then the report's own parents
  const parents = new Map<string, {id: string; slug: string; name: string; hierarchy: string}>();
  for (const c of containers(id)) parents.set(c.id, c);
  for (const b of breadcrumbs) if (b.id !== id && !parents.has(b.id)) parents.set(b.id, {...b, hierarchy: b.hierarchy ?? ""});
  if (state && !parents.has(state.id)) parents.set(state.id, {...state, hierarchy: "State"});
  const ordered = [...parents.values()]
    .filter(p => NEAREST_FIRST.includes(p.hierarchy))
    .sort((a, b) => NEAREST_FIRST.indexOf(a.hierarchy) - NEAREST_FIRST.indexOf(b.hierarchy))
    // one of each level: the first is the one that contains most of it
    .filter((p, i, all) => all.findIndex(o => o.hierarchy === p.hierarchy) === i);

  const out: ReportHierarchy = {
    parents: ordered.filter(p => p.hierarchy !== "MSA").map(p => ({name: p.name, href: `/profile/geo/${p.slug}`})),
    ranks: [],
    groups: []
  };
  const metro = ordered.find(p => p.hierarchy === "MSA");
  if (metro) out.metro = {name: metro.name, href: `/profile/geo/${metro.slug}`};
  const levelPath = levelLandingPath("Geography", hierarchy, state?.slug);
  if (levelPath) out.level = {name: SINGULAR[hierarchy] ?? hierarchy, href: levelPath};

  // how it ranks among its peers, in its state and in the country
  const landing = landingLevel("Geography", hierarchy);
  if (landing) {
    const figures = await population(hierarchy);
    const plural = pluralInSentence(landing.level);
    if (state && landing.level.byState) {
      const inState = rankOf(id, stateMembers(hierarchy, state.fips), figures);
      if (inState) out.ranks.push({...inState, by: "population", among: `${plural} in ${state.name}`, href: landingPath(landing.family, landing.level, state.slug)});
    }
    const national = rankOf(id, levelMembers("Geography", hierarchy), figures);
    if (national) out.ranks.push({...national, by: "population", among: `${plural} in the United States`, href: landingPath(landing.family, landing.level)});
    const facts = geoFacts(id);
    const people = figures.values.get(id);
    if (facts?.landSqMi) {
      out.landSqMi = facts.landSqMi;
      if (people !== undefined) out.density = people / facts.landSqMi;
    }
  }

  // what it contains
  const add = async (level: string, members: GeoMember[], stateSlug?: string) => {
    if (!members.length) return;
    const found = landingLevel("Geography", level);
    const more = found && (stateSlug ? found.level.byState : true) && (stateSlug || hierarchy === "Nation")
      ? {name: `All ${pluralInSentence(found.level)}${stateSlug ? ` in ${member.name}` : ""}`, href: landingPath(found.family, found.level, stateSlug)}
      : undefined;
    const g = group("geo", level, members, await population(level), measure, hierarchy !== "Nation" && hierarchy !== "MSA", more);
    if (g) out.groups.push(g);
  };
  if (hierarchy === "Nation") await add("State", levelMembers("Geography", "State"));
  else if (hierarchy === "State") {
    for (const level of ["County", "Place", "Congressional District", "School District", "PUMA"]) await add(level, stateMembers(level, id.slice(7, 9)), member.slug);
  }
  else if (hierarchy === "County") {
    for (const level of ["Place", "School District"]) await add(level, containedMembers(id, level));
  }
  else if (hierarchy === "MSA") {
    for (const level of ["County", "Place"]) await add(level, containedMembers(id, level));
  }
  return out;
}

async function classificationHierarchy(profile: string, member: MemberRow, breadcrumbs: {id: string; slug: string; name: string}[]): Promise<ReportHierarchy> {
  const landing = landingLevel(member.dimension, member.hierarchy);
  const out: ReportHierarchy = {
    // nearest first: the report lists its parents from the top of the hierarchy down
    parents: breadcrumbs.filter(b => b.id !== member.id || b.slug !== member.slug).slice().reverse().map(b => ({name: b.name, href: `/profile/${profile}/${b.slug || b.id}`})),
    ranks: [],
    groups: []
  };
  if (!landing) return out;
  const {family, level} = landing;
  out.level = {name: SINGULAR[member.hierarchy] ?? member.hierarchy, href: landingPath(family, level)};
  // universities are listed by state on their landing pages, not ranked here
  if (member.hierarchy === "University") return out;

  const measure = MEASURES[level.measures[0]];
  const figures = await getLevelFigures(level.hierarchy, level.measures[0]);
  const rank = rankOf(member.id, levelMembers(member.dimension, member.hierarchy), figures);
  if (rank && !measure.ascending) out.ranks.push({...rank, by: measure.phrase, among: pluralInSentence(level), href: landingPath(family, level)});

  // what it contains: the members one level down that name it among their ancestors
  const below = family.levels[family.levels.indexOf(level) + 1];
  if (below && below.hierarchy !== "University") {
    let lookup: Record<string, string[]> = {};
    try {
      lookup = await parentLookup(profile);
    }
    catch {
      return out;
    }
    const ids = Object.keys(lookup).filter(child => child !== member.id && lookup[child].includes(member.id));
    const members = getMembers(member.dimension, ids, below.hierarchy).filter(m => !m.hidden);
    const childMeasure = MEASURES[below.measures[0]];
    const g = group(profile, below.hierarchy, members, await getLevelFigures(below.hierarchy, below.measures[0]), childMeasure, false);
    if (g) out.groups.push({...g, label: below.plural});
  }
  return out;
}

/** The hierarchy of a report's member. Never throws: a report renders without it. */
export async function reportHierarchy(profile: string, member: MemberRow, breadcrumbs: {id: string; slug: string; name: string; hierarchy?: string}[]): Promise<ReportHierarchy | undefined> {
  try {
    const hierarchy = member.dimension === "Geography" ? await geoHierarchy(member, breadcrumbs) : await classificationHierarchy(profile, member, breadcrumbs);
    return hierarchy.level || hierarchy.parents.length || hierarchy.groups.length ? hierarchy : undefined;
  }
  catch (error) {
    console.warn(`[hierarchy] ${profile}/${member.slug}: ${(error as Error).message}`);
    return undefined;
  }
}
