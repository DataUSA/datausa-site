/**
 * "Keep Exploring" for the profiles other than geography (QA DIFF-008): a port of the University
 * and other-dimension branches of the legacy `GET /api/:slug/similar/:id` route
 * (`api/crosswalks.js` on `main`). Geographies stay in `similar.ts`.
 *
 * Kept apart from `similar.ts` on purpose: that module is imported by the in-process `/api/...`
 * endpoints, whose code is hashed into generator cache keys, so a change there would re-key every
 * generator that calls them.
 *
 * - University (University level): the precomputed similar universities (the same list the
 *   university attributes use), up to 5.
 * - University (Carnegie levels): the level's most popular members.
 * - Occupations, industries, degrees (CIP) and products (NAPCS): the member's parents plus its
 *   neighbours by rank on the profile's measure (the legacy `/api/neighbors` window of 5 around the
 *   member, in the member's latest year), most popular first.
 */
import universitySimilar from "@/content/shared/data/similar_universities_with_dist.json";
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {getMembers, getProfile, listMembers, type MemberRow} from "@/lib/dimensions/db";
import {memberParents} from "@/lib/dimensions/parents";

const LIMIT = 6;
const WINDOW = 5;

/** The cube and measure the legacy neighbours ranked each dimension by. */
const RANKING: Record<string, {cube: string; measure: string; time: string}> = {
  "PUMS Occupation": {cube: "pums_5", measure: "Average Wage", time: "Year"},
  "PUMS Industry": {cube: "pums_5", measure: "Average Wage", time: "Year"},
  "CIP": {cube: "ipeds_completions", measure: "Completions", time: "Year"},
  "NAPCS": {cube: "usa_spending", measure: "Obligation Amount", time: "Fiscal Year"}
};

/** Similar members for the Keep Exploring tiles of a non-geography report. Never throws. */
export async function similarMembers(profileSlug: string, member: MemberRow): Promise<MemberRow[]> {
  try {
    let rows: MemberRow[];
    if (member.dimension === "University") {
      rows = member.hierarchy === "University"
        ? getMembers("University", ((universitySimilar as Record<string, {university: string}[]>)[member.id] ?? []).slice(0, 5).map(d => d.university))
        : listMembers(member.dimension, member.hierarchy, LIMIT + 1);
    }
    else {
      const profile = getProfile(profileSlug);
      const parents = profile ? await memberParents(profileSlug, member, profile.levels) : [];
      const parentRows = parents.flatMap(p => getMembers(member.dimension, [p.id], p.hierarchy));
      rows = parentRows.concat(await rankNeighbors(member));
    }
    return rows
      .filter((d, i, all) => d.id !== member.id && !d.hidden && all.findIndex(a => a.id === d.id && a.hierarchy === d.hierarchy) === i)
      .sort((a, b) => (b.zvalue ?? 0) - (a.zvalue ?? 0))
      .slice(0, LIMIT);
  }
  catch (error) {
    console.warn(`[similar] ${profileSlug}/${member.slug}: ${(error as Error).message}`);
    return [];
  }
}

/** Members ranked next to `member` on its dimension's measure, in the member's latest year with data. */
async function rankNeighbors(member: MemberRow): Promise<MemberRow[]> {
  const ranking = RANKING[member.dimension];
  if (!ranking) return [];
  const {cube, measure, time} = ranking;
  const level = member.hierarchy;
  const own = await fetchData(tesseractDataUrl({cube, drilldowns: `${time},${level}`, measures: measure, include: `${level}:${member.id}`}));
  const years = (own.data?.data ?? []).map(d => d[time]).filter(y => y !== undefined && y !== null);
  if (!years.length) return [];
  const latest = years.reduce((a, b) => Number(b) > Number(a) ? b : a);
  const all = await fetchData(tesseractDataUrl({cube, drilldowns: level, measures: measure, include: `${time}:${latest}`}));
  const list = (all.data?.data ?? []).slice().sort((a, b) => Number(b[measure] ?? 0) - Number(a[measure] ?? 0));
  const index = list.findIndex(d => String(d[`${level} ID`]) === member.id);
  if (index < 0) return [];
  // the legacy window: the first or last five near the ends, else five centred on the member
  const window = index <= WINDOW / 2 + 1 ? list.slice(0, WINDOW)
    : index > list.length - WINDOW / 2 - 1 ? list.slice(-WINDOW)
      : list.slice(Math.ceil(index - WINDOW / 2), Math.ceil(index - WINDOW / 2) + WINDOW);
  return getMembers(member.dimension, window.map(d => String(d[`${level} ID`])), level);
}
