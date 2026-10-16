/**
 * Cached loaders for the latest-data home page. BLS and EIA publish on fixed mornings, so a few
 * hours of caching keeps the page within a day of every release while staying under the BLS
 * no-key limit (25 requests a day; national figures take one request, states three). Entries carry
 * the `external-data` tag, so `POST /api/revalidate` with that tag refreshes them right after a
 * release. When a source fails, the last good result is served and retried soon. That result is kept
 * in memory and in a small JSON file (`LATEST_DATA_DIR`, default `.next/cache/latest-data`), so a
 * restart or a used-up BLS allowance does not empty the page.
 */
import {mkdir, readFile, writeFile} from "node:fs/promises";
import {join, resolve} from "node:path";
import {cacheLife, cacheTag} from "next/cache";
import {listMembers} from "@/lib/dimensions/db";
import {fetchBlsSeries} from "@/lib/latest/bls";
import {EIA_SERIES, fetchEiaWeekly} from "@/lib/latest/eia";
import {fuel, inflation, NATIONAL_SERIES, payrolls, stateSummary, unemployment, wages, type CategoryChange, type Indicator, type StateRate} from "@/lib/latest/indicators";
import {nextRelease, RELEASES} from "@/content/latest/releases";
import {dateLabel, latest, type Point} from "@/lib/latest/series";

const HOUR = 3600;
const RETRY = {stale: 60, revalidate: 300, expire: 7 * 24 * HOUR};
const ORDER: Indicator["key"][] = ["cpi", "gasoline", "unemployment", "jobs", "wages"];
const ordered = (list: Indicator[]) => [...list].sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));

export interface NationalFigures {
  indicators: Indicator[];
  categories: CategoryChange[];
  /** Reference month of the CPI categories. */
  cpiPeriod?: string;
  /** EIA's next weekly fuel release (`YYYY-MM-DD`). */
  fuelNext?: string;
  checkedAt: string;
}

export interface StateFigures {period: string; rows: StateRate[]; blurb: string[]; checkedAt: string}

let lastNational: NationalFigures | null = null;
let lastStates: StateFigures | null = null;

function snapshotFile(name: string): string {
  return join(resolve(/* turbopackIgnore: true */ process.env.LATEST_DATA_DIR || ".next/cache/latest-data"), `${name}.json`);
}

async function loadSnapshot<T>(name: string): Promise<T | null> {
  try { return JSON.parse(await readFile(snapshotFile(name), "utf8")) as T; }
  catch { return null; }
}

async function saveSnapshot(name: string, value: unknown): Promise<void> {
  try {
    const file = snapshotFile(name);
    await mkdir(resolve(file, ".."), {recursive: true});
    await writeFile(file, JSON.stringify(value));
  }
  catch (error) {
    console.warn(`[latest] could not save ${name} figures: ${(error as Error).message}`);
  }
}

/** CPI, jobs, pay and fuel prices for the United States. Null only if no source has ever answered. */
export async function getNationalFigures(): Promise<NationalFigures | null> {
  "use cache";
  cacheTag("external-data", "latest-data");
  const [bls, gasoline, diesel] = await Promise.allSettled([
    fetchBlsSeries(NATIONAL_SERIES, 10),
    fetchEiaWeekly(EIA_SERIES.gasoline),
    fetchEiaWeekly(EIA_SERIES.diesel)
  ]);
  const indicators: Indicator[] = [];
  let categories: CategoryChange[] = [];
  let cpiPeriod: string | undefined;
  if (bls.status === "fulfilled") {
    const cpi = inflation(bls.value);
    if (cpi) {
      indicators.push(cpi.indicator);
      categories = cpi.categories;
      cpiPeriod = cpi.indicator.period;
    }
    for (const build of [unemployment, payrolls, wages]) {
      const indicator = build(bls.value);
      if (indicator) indicators.push(indicator);
    }
  }
  else console.warn(`[latest] ${(bls.reason as Error).message}`);
  if (gasoline.status === "fulfilled") {
    const indicator = fuel(gasoline.value.series, diesel.status === "fulfilled" ? diesel.value.series : [], gasoline.value.released);
    if (indicator) indicators.push(indicator);
  }
  else console.warn(`[latest] ${(gasoline.reason as Error).message}`);

  const complete = bls.status === "fulfilled" && gasoline.status === "fulfilled";
  if (!complete) lastNational ??= await loadSnapshot<NationalFigures>("national");
  if (!complete && lastNational) {
    cacheLife(RETRY);
    // Keep whatever answered this time, and the last good figures for the rest.
    const fresh = new Set(indicators.map(i => i.key));
    return {...lastNational, indicators: ordered([...indicators, ...lastNational.indicators.filter(i => !fresh.has(i.key))]), categories: categories.length ? categories : lastNational.categories};
  }
  if (!indicators.length) {
    cacheLife(RETRY);
    return null;
  }
  cacheLife(complete ? {stale: 300, revalidate: 2 * HOUR, expire: 14 * 24 * HOUR} : RETRY);
  const fuelNext = gasoline.status === "fulfilled" ? gasoline.value.nextRelease : undefined;
  const result = {indicators: ordered(indicators), categories, cpiPeriod, fuelNext, checkedAt: new Date().toISOString()};
  if (complete) {
    lastNational = result;
    await saveSnapshot("national", result);
  }
  return result;
}

/** LAUS series id for a state's seasonally adjusted unemployment rate. */
function lausId(stateId: string): string {
  return `LASST${stateId.slice(-2)}0000000000003`;
}

/** Unemployment rate by state (a month behind the national figure). */
export async function getStateFigures(): Promise<StateFigures | null> {
  "use cache";
  cacheTag("external-data", "latest-data", "dimensions");
  const states = listMembers("Geography", "State", 100, true).filter(s => /^04000US\d{2}$/.test(s.id) && Number(s.id.slice(-2)) <= 72);
  try {
    const data = await fetchBlsSeries(states.map(s => lausId(s.id)), 2);
    const series = states.map(s => ({state: s, points: data.get(lausId(s.id)) ?? []}));
    const period = series.map(s => latest(s.points)?.date).filter((d): d is string => Boolean(d)).sort().at(-1);
    if (!period) throw new Error("BLS returned no state rates");
    const yearAgo = `${Number(period.slice(0, 4)) - 1}${period.slice(4)}`;
    const value = (points: Point[], date: string) => points.find(p => p.date === date)?.value ?? null;
    const rows: StateRate[] = series
      .map(({state, points}) => ({id: state.id, name: state.name, slug: state.slug, rate: value(points, period), yearAgo: value(points, yearAgo)}))
      .filter((r): r is StateRate => r.rate !== null);
    cacheLife({stale: 300, revalidate: 12 * HOUR, expire: 21 * 24 * HOUR});
    lastStates = {period, rows, blurb: stateSummary(rows, period), checkedAt: new Date().toISOString()};
    await saveSnapshot("states", lastStates);
    return lastStates;
  }
  catch (error) {
    console.warn(`[latest] ${(error as Error).message}`);
    cacheLife(RETRY);
    lastStates ??= await loadSnapshot<StateFigures>("states");
    return lastStates;
  }
}

export interface UpcomingRelease {name: string; covers: string; date: string; url: string}

/** The next scheduled release of each figure on the page, soonest first. */
export async function getUpcomingReleases(fuelNext?: string): Promise<UpcomingRelease[]> {
  "use cache";
  cacheLife("hours");
  const today = new Date().toISOString().slice(0, 10);
  const out: UpcomingRelease[] = [];
  const covers = {cpi: "Consumer prices", jobs: "Jobs, unemployment and pay", states: "Unemployment by state"} as const;
  for (const kind of ["cpi", "jobs", "states"] as const) {
    const next = nextRelease(kind, today);
    if (next) out.push({name: RELEASES[kind].name, covers: `${covers[kind]}, ${dateLabel(next.period)}`, date: next.date, url: RELEASES[kind].url});
  }
  if (fuelNext && fuelNext >= today) out.push({name: "Gasoline and Diesel Fuel Update", covers: "Gas and diesel prices, weekly", date: fuelNext, url: "https://www.eia.gov/petroleum/gasdiesel/"});
  return out.sort((a, b) => a.date.localeCompare(b.date));
}
