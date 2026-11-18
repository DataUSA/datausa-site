/**
 * Figures behind the landing pages: one measure for every member of a level, in the latest period
 * the cube has and, where the measure asks for it, an earlier one to measure change from.
 *
 * Each (level, measure) is one or two Tesseract queries shared by every page of the level (the
 * national page and its 52 state pages read the same lookup). The responses go through the data
 * cache like any other request; the parsed lookup is also kept in the worker for an hour. A failed
 * request yields an empty lookup, which the pages treat as "no figures", and is retried after half a
 * minute.
 */
import {MEASURES, type LandingMeasure, type MeasureKey} from "@/content/landing/levels";
import {fetchData, fetchJsonRaw, tesseractDataUrl} from "@/lib/api/tesseract";
import {getUniversityFigures} from "@/lib/dimensions/universities";

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
  // The data cache can go on answering with a failure it holds after the API has recovered (seen
  // for minutes after a rate limit): ask again, past the cache, before settling for no figures.
  // This lookup is kept for an hour, or retried in half a minute, so the extra request is rare.
  // A held answer without rows (a challenge page, an empty body) counts as a failure too.
  if (result.error || !(result.data?.data as Row[] | undefined)?.length) result = await fetchJsonRaw(url);
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

/** The three university figures come from one shared lookup, which also knows each university's state. */
async function universityFigures(key: "enrollment" | "endowment" | "acceptance"): Promise<LevelFigures> {
  const figures = await getUniversityFigures();
  const values = new Map<string, number>();
  for (const [id, figure] of figures.byId) {
    const value = figure[key];
    if (value !== undefined) values.set(id, value);
  }
  return {year: figures.years[key], previousYear: null, values, previous: new Map()};
}

const TTL_MS = 60 * 60 * 1000;
const RETRY_MS = 30 * 1000;
const cache = new Map<string, {expires: number; value: Promise<LevelFigures>}>();

export function getLevelFigures(hierarchy: string, key: MeasureKey): Promise<LevelFigures> {
  const name = `${hierarchy}|${key}`;
  const hit = cache.get(name);
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = (hierarchy === "University" && (key === "enrollment" || key === "endowment" || key === "acceptance")
    ? universityFigures(key)
    : load(hierarchy, MEASURES[key])
  ).catch(() => EMPTY);
  const entry = {expires: Date.now() + TTL_MS, value};
  cache.set(name, entry);
  value.then(figures => { if (!figures.values.size) entry.expires = Date.now() + RETRY_MS; });
  return value;
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
