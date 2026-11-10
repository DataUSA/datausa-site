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
 *   member, in the level's latest year), most popular first. The ranking is one query per level,
 *   shared by every report of the level (`levelRanking`), so a page sends no query of its own.
 */
import universitySimilar from "@/content/shared/data/similar_universities_with_dist.json";
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {withUpstreamScope} from "@/lib/api/upstream-scope";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisConfigured} from "@/lib/cache/redis";
import {cachedValue} from "@/lib/cache/values";
import {parentLookup} from "@/lib/content/lookups";
import {getMembers, getProfile, listMembers, type MemberRow} from "@/lib/dimensions/db";

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
      // the member's ancestors, as `memberParents` finds them (their order doesn't matter: sorted below)
      const parents = getProfile(profileSlug) ? (await parentTable(profileSlug))[member.id] ?? [] : [];
      rows = getMembers(member.dimension, parents).concat(await rankNeighbors(member));
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

/** Members ranked next to `member` on its dimension's measure, in the level's latest year. */
async function rankNeighbors(member: MemberRow): Promise<MemberRow[]> {
  if (!RANKING[member.dimension]) return [];
  const level = member.hierarchy;
  const list = await levelRanking(member.dimension, level);
  const index = list.indexOf(member.id);
  if (index < 0) return [];
  // the legacy window: the first or last five near the ends, else five centred on the member
  const window = index <= WINDOW / 2 + 1 ? list.slice(0, WINDOW)
    : index > list.length - WINDOW / 2 - 1 ? list.slice(-WINDOW)
      : list.slice(Math.ceil(index - WINDOW / 2), Math.ceil(index - WINDOW / 2) + WINDOW);
  return getMembers(member.dimension, window, level);
}

/**
 * The tables Keep Exploring reads on every page (the parent table of a profile, the ranking of a
 * level) are kept in the worker for a while. They change only with a data release: the Redis copy is
 * purged with its cube, and a worker picks up the new one within this time.
 *
 * This also keeps the page off Tesseract when Redis is slow: a Redis read past its deadline opens
 * the circuit breaker, and every page would then rebuild the parent table (one `members` query of
 * ~15 s for occupations) and the ranking.
 */
const MEMO_MS = 10 * 60_000;
type Memo = Map<string, {at: number; value: Promise<unknown>}>;
const memoStore = globalThis as typeof globalThis & {__similarMembersMemoV1?: Memo};
const memo: Memo = memoStore.__similarMembersMemoV1 ??= new Map();

/**
 * `compute`'s result, shared by the worker's pages for `MEMO_MS`. A result built while a request
 * failed, or an empty one, is not kept: the next page retries. Concurrent pages share one computation.
 */
function memoized<T>(name: string, compute: () => Promise<T>, empty: (value: T) => boolean): Promise<T> {
  const hit = memo.get(name);
  if (hit && Date.now() - hit.at < MEMO_MS) return hit.value as Promise<T>;
  const value = withUpstreamScope(compute).then(({value, scope}) => {
    if (scope.failures.length || empty(value)) memo.delete(name);
    return value;
  });
  memo.set(name, {at: Date.now(), value});
  value.catch(() => memo.delete(name));
  return value;
}

/** Member id → ancestor ids for a report family: the shared lookup table, kept in the worker. */
function parentTable(profileSlug: string): Promise<Record<string, string[]>> {
  return memoized(`parents|${profileSlug}`, () => parentLookup(profileSlug), table => !Object.keys(table).length);
}

/**
 * The ids of a level's members, highest on the dimension's measure first, in the latest year the cube
 * has. One query per level, shared by all its reports: in Redis next to the lookup tables (same
 * version, same rule that only complete results are stored), and kept in the worker. The legacy
 * route ranked each member in its own latest year, with two queries per page; members without data
 * in the latest year now show only their parents.
 */
function levelRanking(dimension: string, level: string): Promise<string[]> {
  const version = redisConfigured() ? generatorManifest()?.lookups : undefined;
  const compute = () => computeLevelRanking(dimension, level);
  // no spaces in the key ("Detailed Occupation"), so shell tools can handle it
  const key = `ranking:v1:${dimension}:${level}:${version}`.replace(/ /g, "_");
  return memoized(`ranking|${dimension}|${level}`,
    () => version ? cachedValue(key, `ranking|${dimension}|${level}`, compute) : compute(),
    ids => !ids.length);
}

async function computeLevelRanking(dimension: string, level: string): Promise<string[]> {
  const {cube, measure, time} = RANKING[dimension];
  const result = await fetchData(tesseractDataUrl({cube, drilldowns: `${time},${level}`, measures: measure, time: `${time}.latest`}));
  return (result.data?.data ?? [])
    .filter(d => d[`${level} ID`] !== undefined && d[`${level} ID`] !== null)
    .sort((a, b) => Number(b[measure] ?? 0) - Number(a[measure] ?? 0))
    .map(d => String(d[`${level} ID`]));
}
