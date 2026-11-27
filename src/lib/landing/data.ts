/**
 * Figures behind the landing pages: one measure for every member of a level, in the latest period
 * the cube has and, where the measure asks for it, an earlier one to measure change from.
 *
 * Each (level, measure) is one or two Tesseract queries shared by every page of the level: the
 * national page, its 52 state pages and every report's "in context" section read the same lookup.
 * Some are among the heaviest queries the site sends (the population of every place is 2.5 MB), so
 * a lookup is computed by one worker and shared with the others through Redis, where a deploy or a
 * restart finds it again and a purge of its cube removes it (`src/lib/cache/shared-lookup.ts`).
 * Without Redis each worker computes it, as before. A failed lookup has no figures (the pages
 * then show none) and is tried again 10 s later (30 s without Redis).
 */
import {MEASURES, type LandingMeasure, type MeasureKey} from "@/content/landing/levels";
import {fetchData, fetchJsonRaw, tesseractDataUrl} from "@/lib/api/tesseract";
import {currentScope} from "@/lib/api/upstream-scope";
import {lookupCodeVersion, sharedLookup, sharedLookupKey} from "@/lib/cache/shared-lookup";
import {getUniversityFigures, type UniversityFigures} from "@/lib/dimensions/universities";

export interface LevelFigures {
  /** Period of the figures (the cube's latest for this level). */
  year: number | null;
  /** Period the change is measured from, when the measure has one and the cube has that period. */
  previousYear: number | null;
  values: Map<string, number>;
  previous: Map<string, number>;
}

const EMPTY: LevelFigures = {year: null, previousYear: null, values: new Map(), previous: new Map()};

type Row = Record<string, unknown>;

/** CIP ids are numbers in Tesseract and zero-padded codes on the site ("0100" for 100). */
const CIP_DIGITS: Record<string, number> = {CIP2: 2, CIP4: 4, CIP6: 6};

function memberId(hierarchy: string, value: unknown): string {
  const id = String(value ?? "");
  return CIP_DIGITS[hierarchy] ? id.padStart(CIP_DIGITS[hierarchy], "0") : id;
}

async function query(hierarchy: string, m: LandingMeasure, period: string): Promise<{year: number | null; values: Map<string, number>}> {
  const time = m.time ?? "Year";
  const latest = period === "latest";
  const include = [m.include, latest ? undefined : `${time}:${period}`].filter(Boolean).join(";");
  const url = tesseractDataUrl({
    cube: m.cube,
    drilldowns: `${hierarchy},${time}`,
    measures: m.measure,
    include: include || undefined,
    time: latest ? `${time}.latest` : undefined
  });
  let result = await fetchData(url);
  // Next's data cache (without Redis) can go on answering with a failure it holds after the API has
  // recovered (seen for minutes after a rate limit): ask again, past the cache, before settling for
  // no figures. A held answer without rows (a challenge page, an empty body) counts as a failure
  // too. A shared lookup asks the API itself (an uncached scope): asking again would only repeat a
  // failing query.
  if (!currentScope()?.uncached && (result.error || !(result.data?.data as Row[] | undefined)?.length)) result = await fetchJsonRaw(url);
  const values = new Map<string, number>();
  let year: number | null = null;
  for (const row of (result.data?.data ?? []) as Row[]) {
    const id = memberId(hierarchy, row[`${hierarchy} ID`]);
    const value = Number(row[m.measure]);
    // Tesseract answers a drilldown on a level the cube has no rows for with rows of other levels
    // and an empty name: a member needs an id, and a figure of zero or less is "not reported"
    if (!id || row[m.measure] === null || !Number.isFinite(value) || value <= 0) continue;
    values.set(id, value);
    if (year === null && Number.isFinite(Number(row[time]))) year = Number(row[time]);
  }
  return {year, values};
}

async function load(hierarchy: string, m: LandingMeasure): Promise<LevelFigures> {
  const latest = await query(hierarchy, m, "latest");
  if (!latest.values.size || latest.year === null) return EMPTY;
  let previous = {year: null as number | null, values: new Map<string, number>()};
  if (m.lag) {
    const earlier = await query(hierarchy, m, String(latest.year - m.lag));
    if (earlier.values.size) previous = {year: latest.year - m.lag, values: earlier.values};
  }
  return {year: latest.year, previousYear: previous.year, values: latest.values, previous: previous.values};
}

type UniversityKey = "enrollment" | "endowment" | "acceptance";
/** Each university figure as level figures, made once per copy of the university lookup. */
const universityLevels = new WeakMap<UniversityFigures, Partial<Record<UniversityKey, LevelFigures>>>();

/** The three university figures come from one shared lookup, which also knows each university's state. */

async function universityFigures(key: UniversityKey): Promise<LevelFigures> {
  const figures = await getUniversityFigures();
  let levels = universityLevels.get(figures);
  if (!levels) universityLevels.set(figures, levels = {});
  let level = levels[key];
  if (!level) {
    const values = new Map<string, number>();
    for (const [id, figure] of figures.byId) {
      const value = figure[key];
      if (value !== undefined) values.set(id, value);
    }
    level = levels[key] = {year: figures.years[key], previousYear: null, values, previous: new Map()};
  }
  return level;
}

interface StoredFigures {y: number | null; py: number | null; v: Record<string, number>; p: Record<string, number>}

const encodeFigures = (f: LevelFigures): StoredFigures => ({y: f.year, py: f.previousYear, v: Object.fromEntries(f.values), p: Object.fromEntries(f.previous)});
const decodeFigures = (stored: unknown): LevelFigures => {
  const s = stored as StoredFigures;
  return {year: s.y, previousYear: s.py, values: new Map(Object.entries(s.v)), previous: new Map(Object.entries(s.p))};
};

export function getLevelFigures(hierarchy: string, key: MeasureKey): Promise<LevelFigures> {
  if (hierarchy === "University" && (key === "enrollment" || key === "endowment" || key === "acceptance")) return universityFigures(key);
  const m = MEASURES[key];
  // the code version covers this module and `MEASURES`: a change to either reads no old copy
  const code = lookupCodeVersion("levels");
  return sharedLookup({
    key: sharedLookupKey(`level:${hierarchy}:${key}`, [code, m.cube, m.measure, m.include ?? null, m.time ?? null, m.lag ?? null]),
    shared: code !== undefined,
    label: `${hierarchy} ${m.phrase}`,
    compute: () => load(hierarchy, m),
    encode: encodeFigures,
    decode: decodeFigures,
    fallback: EMPTY
  });
}

/** Every measure of a level, in the order given. */
export async function getLevelData(hierarchy: string, keys: readonly MeasureKey[]): Promise<Record<string, LevelFigures>> {
  const all = await Promise.all(keys.map(key => getLevelFigures(hierarchy, key)));
  return Object.fromEntries(keys.map((key, i) => [key, all[i]]));
}

/** Relative change of a member's figure from the earlier period, or undefined when either is missing. */
export function change(figures: LevelFigures, id: string): number | undefined {
  const now = figures.values.get(id), then = figures.previous.get(id);
  return now !== undefined && then !== undefined && then > 0 ? now / then - 1 : undefined;
}

const commas = new Intl.NumberFormat("en-US", {maximumFractionDigits: 0});
const compact = new Intl.NumberFormat("en-US", {notation: "compact", maximumFractionDigits: 1});
const compactDollars = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1});

export function formatValue(format: LandingMeasure["format"], value: number | undefined | null, short = false): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "–";
  switch (format) {
    case "dollars":
      // the ACS publishes medians above its top code as the code plus one ("$250,000+")
      if (value === 250001 || value === 2000001) return `$${commas.format(value - 1)}+`;
      return short && value >= 1e6 ? compactDollars.format(value) : `$${commas.format(value)}`;
    case "compactDollars": return compactDollars.format(value);
    case "age": return value.toFixed(1);
    case "percent": return `${(value * 100).toFixed(1)}%`;
    default: return short && value >= 1e6 ? compact.format(value) : commas.format(value);
  }
}

export function formatChange(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return "–";
  const pct = value * 100;
  return `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${Math.abs(pct).toFixed(1)}%`;
}
