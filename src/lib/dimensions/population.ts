/**
 * Latest total population per geography, used (like the legacy boot-time `pops` cache) to decide
 * which parents and similar places are worth linking (population above 250,000 when the member
 * itself is that large). Values come from Tesseract at request time and are cached; nothing is
 * stored in the repository.
 */
import {fetchData, tesseractDataUrl} from "@/lib/api/tesseract";
import {geoLevel} from "@/lib/api/geoservice";
import {isPendingLevel} from "@/lib/geo/levels";

export const BIG_POPULATION = 250000;

/** Latest population for each geoid, grouped per summary level into one cached Tesseract query each. */
export async function getPopulations(ids: string[]): Promise<Record<string, number>> {
  const byLevel = new Map<string, string[]>();
  for (const id of Array.from(new Set(ids))) {
    const level = geoLevel(id);
    // a level Tesseract does not carry yet has no population to ask for
    if (!level || isPendingLevel(level)) continue;
    if (!byLevel.has(level)) byLevel.set(level, []);
    byLevel.get(level)!.push(id);
  }
  const out: Record<string, number> = {};
  await Promise.all(Array.from(byLevel.entries()).map(async ([level, levelIds]) => {
    const url = tesseractDataUrl({
      cube: "acs_yg_total_population_5",
      drilldowns: level,
      measures: "Population",
      include: `${level}:${levelIds.join(",")}`,
      time: "Year.latest"
    });
    const result = await fetchData(url);
    for (const row of result.data?.data ?? []) {
      const id = String(row[`${level} ID`]);
      const pop = Number(row.Population);
      if (id && !Number.isNaN(pop)) out[id] = pop;
    }
  }));
  return out;
}

/** Geography levels that have reports and a population figure in the ACS population cube. */
export const POPULATION_LEVELS = ["State", "County", "MSA", "PUMA", "Congressional District", "Place"] as const;

export interface LevelPopulations {
  /** ACS 5-year vintage the figures belong to (the cube's latest year). */
  year: number | null;
  byId: Map<string, number>;
}

const LEVEL_TTL_MS = 60 * 60 * 1000;
const levelCache = new Map<string, {expires: number; value: Promise<LevelPopulations>}>();

/**
 * Latest population of every geography of one level, in a single Tesseract query (about 2 MB for
 * the 29,000 places, a few KB for states). The response is cached like any other data request; the
 * parsed lookup is also kept in memory for an hour because the search page reads it on every
 * keystroke. A failed request yields an empty lookup and is retried after half a minute.
 */
export function getLevelPopulations(level: string): Promise<LevelPopulations> {
  const cached = levelCache.get(level);
  if (cached && cached.expires > Date.now()) return cached.value;
  const value = (async (): Promise<LevelPopulations> => {
    const url = tesseractDataUrl({cube: "acs_yg_total_population_5", drilldowns: `${level},Year`, measures: "Population", time: "Year.latest"});
    const result = await fetchData(url);
    const rows = result.data?.data ?? [];
    const byId = new Map<string, number>();
    let year: number | null = null;
    for (const row of rows) {
      const id = String(row[`${level} ID`] ?? "");
      const pop = Number(row.Population);
      if (id && Number.isFinite(pop)) byId.set(id, pop);
      if (year === null && Number.isFinite(Number(row.Year))) year = Number(row.Year);
    }
    return {year, byId};
  })();
  const entry = {expires: Date.now() + LEVEL_TTL_MS, value};
  levelCache.set(level, entry);
  value.then(({byId}) => { if (!byId.size) entry.expires = Date.now() + 30 * 1000; });
  return value;
}
