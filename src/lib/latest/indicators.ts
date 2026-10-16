/**
 * Headline figures and the sentences that explain them, built from BLS and EIA series. Pure: the
 * fetching and caching live in `@/lib/latest/data`. Every sentence is computed from the numbers, so
 * the copy stays right when a new month arrives (and says less rather than something wrong when a
 * comparison is unavailable, as for months next to the uncollected October 2025).
 */
import {RELEASES, releaseDate, type ReleaseKind} from "@/content/latest/releases";
import {
  at, dateLabel, difference, extremeSince, lastMonths, latest, percentChange, previous, runStart, trailingMean, type Point
} from "@/lib/latest/series";

export const CPI_ALL = "CUUR0000SA0";
export const CPI_ALL_SA = "CUSR0000SA0";
export const CPI_CORE = "CUUR0000SA0L1E";
export const UNEMPLOYMENT = "LNS14000000";
export const PAYROLLS = "CES0000000001";
export const HOURLY_EARNINGS = "CES0500000003";

/** CPI categories shown as 12-month changes (U.S. city average, not seasonally adjusted). */
export const CPI_CATEGORIES: {id: string; label: string; group: string}[] = [
  {id: "CUUR0000SETB01", label: "Gasoline", group: "Energy"},
  {id: "CUUR0000SEHF01", label: "Electricity", group: "Energy"},
  {id: "CUUR0000SEHF02", label: "Utility gas", group: "Energy"},
  {id: "CUUR0000SAF11", label: "Groceries", group: "Food"},
  {id: "CUUR0000SEFV", label: "Restaurant meals", group: "Food"},
  {id: "CUUR0000SEFC01", label: "Beef", group: "Food"},
  {id: "CUUR0000SEFH", label: "Eggs", group: "Food"},
  {id: "CUUR0000SEFP01", label: "Coffee", group: "Food"},
  {id: "CUUR0000SAH1", label: "Shelter", group: "Housing"},
  {id: "CUUR0000SAM", label: "Medical care", group: "Services"},
  {id: "CUUR0000SAS4", label: "Transportation services", group: "Services"},
  {id: "CUUR0000SETA01", label: "New vehicles", group: "Goods"},
  {id: "CUUR0000SETA02", label: "Used cars and trucks", group: "Goods"},
  {id: "CUUR0000SAA", label: "Apparel", group: "Goods"}
];

export const NATIONAL_SERIES = [CPI_ALL, CPI_ALL_SA, CPI_CORE, UNEMPLOYMENT, PAYROLLS, HOURLY_EARNINGS, ...CPI_CATEGORIES.map(c => c.id)];

export interface Source {name: string; url: string}

export interface Indicator {
  key: "cpi" | "unemployment" | "jobs" | "wages" | "gasoline";
  label: string;
  /** A short sentence for the figure ("Inflation rose to 3.7% in September"). */
  headline: string;
  /** The headline figure, formatted ("3.7%", "+29,000", "$4.33"). */
  value: string;
  /** What the figure measures, in a few words. */
  measure: string;
  /** Reference period ("September 2026", "Week of 12 October 2026"). */
  period: string;
  released?: string;
  preliminary?: boolean;
  blurb: string[];
  /** Points for the sparkline, and how to label them. */
  spark: {points: Point[]; unit: "percent" | "jobs" | "dollars"; zero?: boolean};
  source: Source;
}

export interface CategoryChange {label: string; group: string; change: number}

const pct = (v: number, digits = 1) => `${v.toFixed(digits)}%`;
const points = (v: number) => `${Math.abs(v).toFixed(1)} percentage point${Math.abs(v).toFixed(1) === "1.0" ? "" : "s"}`;
const whole = new Intl.NumberFormat("en-US", {maximumFractionDigits: 0});
const jobs = (thousands: number) => whole.format(Math.round(Math.abs(thousands)) * 1000);
const dollars = (v: number) => `$${v.toFixed(2)}`;
const month = (date: string) => dateLabel(date, false);

/** "in August" when the comparison month is in the same year as `date`, else "in December 2025". */
function inMonth(date: string, reference: string): string {
  return date.slice(0, 4) === reference.slice(0, 4) ? `in ${month(date)}` : `in ${dateLabel(date)}`;
}

/** "the fastest pace since May 2023" etc., only when the comparison reaches back at least 6 months. */
function sinceClause(series: Point[], direction: "up" | "down", up: string, down: string): string | null {
  const extreme = extremeSince(series, direction);
  if (!extreme?.since || (extreme.months ?? 0) < 6) return null;
  return `${direction === "up" ? up : down} since ${dateLabel(extreme.since.date)}`;
}

function released(kind: ReleaseKind, period: string): string | undefined {
  return releaseDate(kind, period);
}

function source(kind: ReleaseKind): Source {
  return {name: `Bureau of Labor Statistics, ${RELEASES[kind].name}`, url: RELEASES[kind].url};
}

/** Inflation: the 12-month CPI change, or the monthly change when the year-earlier month is missing. */
export function inflation(data: Map<string, Point[]>): {indicator: Indicator; categories: CategoryChange[]} | null {
  const index = data.get(CPI_ALL) ?? [];
  const yoy = percentChange(index);
  const last = latest(index);
  if (!last) return null;
  const current = at(yoy, last.date);
  const monthly = percentChange(data.get(CPI_ALL_SA) ?? [], 1);
  const m1 = at(monthly, last.date);
  const blurb: string[] = [];
  let value: string;
  let measure: string;
  let headline: string;
  if (current) {
    const v = current.value as number;
    const before = previous(yoy, last.date);
    let first = `Prices ${v >= 0 ? "rose" : "fell"} ${pct(Math.abs(v))} over the 12 months to ${dateLabel(last.date)}`;
    if (before) {
      const b = before.value as number;
      const direction = v > b ? "up" : "down";
      if (b.toFixed(1) === v.toFixed(1)) first += `, the same rate as ${inMonth(before.date, last.date)}`;
      else {
        first += `, ${direction} from ${pct(b)} ${inMonth(before.date, last.date)}`;
        const since = sinceClause(yoy, direction, "the fastest pace", "the slowest pace");
        if (since) first += ` and ${since}`;
      }
    }
    blurb.push(`${first}.`);
    value = pct(v);
    measure = "Inflation, past 12 months";
    const b = before?.value;
    const verb = b === undefined || b === null || b.toFixed(1) === v.toFixed(1) ? "held at" : v > b ? "rose to" : "eased to";
    headline = `Inflation ${verb} ${pct(v)} in ${month(last.date)}`;
  }
  else if (m1) {
    value = pct(m1.value as number);
    measure = "Inflation, past month";
    headline = `Prices ${(m1.value as number) >= 0 ? "rose" : "fell"} ${pct(Math.abs(m1.value as number))} in ${month(last.date)}`;
  }
  else return null;
  if (m1) blurb.push(`Seasonally adjusted, prices ${(m1.value as number) >= 0 ? "rose" : "fell"} ${pct(Math.abs(m1.value as number))} from ${month(previous(index, last.date)?.date ?? last.date)}.`);

  const categories = CPI_CATEGORIES
    .map(c => ({label: c.label, group: c.group, change: at(percentChange(data.get(c.id) ?? []), last.date)?.value}))
    .filter((c): c is CategoryChange => typeof c.change === "number")
    .sort((a, b) => b.change - a.change);
  const top = categories[0];
  const core = at(percentChange(data.get(CPI_CORE) ?? []), last.date);
  const parts: string[] = [];
  if (top && top.change > 0) parts.push(`${top.label} prices are up ${pct(top.change)} from a year earlier, the most of the categories shown`);
  if (core) parts.push(`excluding food and energy, prices rose ${pct(core.value as number)}`);
  if (parts.length) blurb.push(`${parts.join("; ").replace(/^./, c => c.toUpperCase())}.`);

  return {
    indicator: {
      key: "cpi",
      label: "Consumer prices",
      headline,
      value,
      measure,
      period: dateLabel(last.date),
      released: released("cpi", last.date),
      blurb,
      spark: {points: lastMonths(current ? yoy : monthly, 36), unit: "percent", zero: true},
      source: source("cpi")
    },
    categories
  };
}

/** The unemployment rate, with the month's payroll change. */
export function unemployment(data: Map<string, Point[]>): Indicator | null {
  const rate = data.get(UNEMPLOYMENT) ?? [];
  const last = latest(rate);
  if (!last) return null;
  const v = last.value as number;
  let first = `The unemployment rate was ${pct(v)} in ${dateLabel(last.date)}`;
  const before = previous(rate, last.date);
  if (before) {
    const b = before.value as number;
    if (b === v) first += `, unchanged from ${month(before.date)}`;
    else {
      const direction = v > b ? "up" : "down";
      first += `, ${direction} from ${pct(b)} ${inMonth(before.date, last.date)}`;
      const since = sinceClause(rate, direction, "the highest", "the lowest");
      if (since) first += ` and ${since}`;
    }
  }
  const yearAgo = at(rate, `${Number(last.date.slice(0, 4)) - 1}${last.date.slice(4)}`);
  const blurb = [`${first}.`];
  if (yearAgo) {
    const d = v - (yearAgo.value as number);
    blurb.push(d === 0 ? `That is the same as a year earlier.` : `That is ${points(d)} ${d > 0 ? "higher" : "lower"} than a year earlier.`);
  }
  return {
    key: "unemployment",
    label: "Unemployment rate",
    headline: `Unemployment ${!before || before.value === v ? "held at" : v > (before.value as number) ? "rose to" : "fell to"} ${pct(v)}`,
    value: pct(v),
    measure: "Share of the labor force without a job",
    period: dateLabel(last.date),
    released: released("jobs", last.date),
    blurb,
    spark: {points: lastMonths(rate, 36), unit: "percent"},
    source: source("jobs")
  };
}

/** Payroll jobs added in the latest month. */
export function payrolls(data: Map<string, Point[]>): Indicator | null {
  const change = difference(data.get(PAYROLLS) ?? []);
  const last = latest(change);
  if (!last) return null;
  const v = last.value as number;
  const blurb = [`Employers ${v >= 0 ? "added" : "cut"} ${jobs(v)} jobs in ${dateLabel(last.date)}.`];
  const mean = trailingMean(change, 3);
  if (mean !== null) blurb.push(`Over the last three months, payrolls ${mean >= 0 ? "grew" : "shrank"} by an average of ${jobs(mean)} a month.`);
  const year = trailingMean(change, 12);
  if (year !== null) blurb.push(`The average for the past year is ${year >= 0 ? "" : "a loss of "}${jobs(year)} a month.`);
  if (last.preliminary) blurb.push(`The latest two months are first estimates, which BLS revises in the next two reports.`);
  return {
    key: "jobs",
    label: "Jobs added",
    headline: v >= 0 ? `Employers added ${jobs(v)} jobs` : `Payrolls fell by ${jobs(v)}`,
    value: `${v >= 0 ? "+" : "−"}${jobs(v)}`,
    measure: "Change in nonfarm payroll jobs",
    period: dateLabel(last.date),
    released: released("jobs", last.date),
    preliminary: last.preliminary,
    blurb,
    spark: {points: lastMonths(change, 36), unit: "jobs", zero: true},
    source: source("jobs")
  };
}

/** Average hourly pay growth against inflation. */
export function wages(data: Map<string, Point[]>): Indicator | null {
  const pay = percentChange(data.get(HOURLY_EARNINGS) ?? []);
  const prices = percentChange(data.get(CPI_ALL) ?? []);
  const last = latest(pay);
  if (!last) return null;
  const v = last.value as number;
  const cpi = at(prices, last.date);
  const blurb: string[] = [];
  if (cpi) {
    const c = cpi.value as number;
    const relation = v.toFixed(1) === c.toFixed(1) ? "the same as" : v > c ? "more than" : "less than";
    blurb.push(`Average hourly pay rose ${pct(v)} over the year to ${dateLabel(last.date)}, ${relation} the ${pct(c)} rise in prices.`);
    if (relation !== "the same as") {
      const behind = relation === "less than";
      const start = runStart(pay, prices, behind ? (x, y) => x < y : (x, y) => x > y);
      if (start && start < last.date) blurb.push(`Pay has ${behind ? "grown more slowly than" : "outpaced"} prices every month since ${dateLabel(start)}.`);
    }
  }
  else blurb.push(`Average hourly pay rose ${pct(v)} over the year to ${dateLabel(last.date)}.`);
  const amount = at(data.get(HOURLY_EARNINGS) ?? [], last.date);
  if (amount) blurb.push(`The average private-sector worker earned ${dollars(amount.value as number)} an hour.`);
  return {
    key: "wages",
    label: "Pay",
    headline: !cpi || v.toFixed(1) === (cpi.value as number).toFixed(1) ? `Pay is up ${pct(v)} from a year ago` : v > (cpi.value as number) ? "Pay is outpacing prices" : "Pay is trailing prices",
    value: pct(v),
    measure: "Growth in average hourly earnings, past 12 months",
    period: dateLabel(last.date),
    released: released("jobs", last.date),
    blurb,
    spark: {points: lastMonths(pay, 36), unit: "percent"},
    source: source("jobs")
  };
}

/** The point nearest to `days` before `date`, within three days. */
function daysBefore(series: Point[], date: string, days: number): Point | undefined {
  const target = Date.parse(date) - days * 864e5;
  let best: Point | undefined;
  for (const p of series) {
    if (p.value === null) continue;
    const gap = Math.abs(Date.parse(p.date) - target);
    if (gap <= 3 * 864e5 && (!best || gap < Math.abs(Date.parse(best.date) - target))) best = p;
  }
  return best;
}

/** Weekly gasoline and diesel prices. */
export function fuel(gasoline: Point[], diesel: Point[], releasedOn?: string): Indicator | null {
  const last = latest(gasoline);
  if (!last) return null;
  const v = last.value as number;
  const yearAgo = daysBefore(gasoline, last.date, 364);
  let first = `A gallon of regular gasoline averaged ${dollars(v)} on ${dateLabel(last.date)}`;
  if (yearAgo) {
    const d = v - (yearAgo.value as number);
    first += Math.abs(d) < 0.005 ? `, the same as a year earlier` : `, ${dollars(Math.abs(d))} ${d > 0 ? "more" : "less"} than a year earlier`;
  }
  const blurb = [`${first}.`];
  const peak = (series: Point[], end: string) => series.filter(p => p.value !== null && p.date > `${Number(end.slice(0, 4)) - 1}${end.slice(4)}`).reduce<Point | undefined>((a, b) => !a || (b.value as number) > (a.value as number) ? b : a, undefined);
  const gasPeak = peak(gasoline, last.date);
  if (gasPeak && gasPeak.date !== last.date && (gasPeak.value as number) - v >= 0.05) blurb.push(`That is down from ${dollars(gasPeak.value as number)} on ${dateLabel(gasPeak.date, gasPeak.date.slice(0, 4) !== last.date.slice(0, 4))}, the highest of the past year.`);
  else {
    const since = sinceClause(gasoline, "up", "the highest", "the lowest");
    if (since) blurb.push(`That is ${since}.`);
  }
  const d = latest(diesel);
  if (d) {
    const dv = d.value as number;
    const record = diesel.reduce((a, b) => (b.value ?? -Infinity) > (a.value ?? -Infinity) ? b : a);
    let text = `Diesel averaged ${dollars(dv)}`;
    if (record.date === d.date) text += `, the highest in EIA's records, which go back to ${diesel[0].date.slice(0, 4)}`;
    else if (record.date > `${Number(d.date.slice(0, 4)) - 1}${d.date.slice(4)}` && (record.value as number) - dv >= 0.05) text += `, down from a record ${dollars(record.value as number)} on ${dateLabel(record.date, record.date.slice(0, 4) !== d.date.slice(0, 4))}`;
    blurb.push(`${text}.`);
  }
  return {
    key: "gasoline",
    label: "Gas prices",
    headline: yearAgo && Math.abs(v - (yearAgo.value as number)) >= 0.005 ? `Gas costs ${dollars(Math.abs(v - (yearAgo.value as number)))} ${v > (yearAgo.value as number) ? "more" : "less"} than a year ago` : `Gas averages ${dollars(v)} a gallon`,
    value: dollars(v),
    measure: "U.S. regular gasoline, per gallon",
    period: `Week of ${dateLabel(last.date)}`,
    released: releasedOn,
    blurb,
    spark: {points: gasoline.filter(p => p.date > `${Number(last.date.slice(0, 4)) - 3}${last.date.slice(4)}`), unit: "dollars"},
    source: {name: "Energy Information Administration, Gasoline and Diesel Fuel Update", url: "https://www.eia.gov/petroleum/gasdiesel/"}
  };
}

export interface StateRate {id: string; name: string; slug: string; rate: number; yearAgo: number | null}

/** Sentences for the state unemployment map. */
export function stateSummary(rows: StateRate[], period: string): string[] {
  const states = rows.filter(r => r.id !== "04000US72");
  if (!states.length) return [];
  const sorted = [...states].sort((a, b) => b.rate - a.rate);
  const high = sorted.filter(r => r.rate === sorted[0].rate);
  const low = sorted.filter(r => r.rate === sorted[sorted.length - 1].rate);
  const place = (r: StateRate) => r.id === "04000US11" ? "the District of Columbia" : r.name;
  const names = (list: StateRate[]) => list.length > 2 ? `${list.length} states` : list.map(place).join(" and ");
  const blurb = [`In ${dateLabel(period)}, unemployment ranged from ${pct(low[0].rate)} in ${names(low)} to ${pct(high[0].rate)} in ${names(high)}.`];
  const compared = states.filter(r => r.yearAgo !== null);
  if (compared.length) {
    const higher = compared.filter(r => r.rate > (r.yearAgo as number)).length;
    const lower = compared.filter(r => r.rate < (r.yearAgo as number)).length;
    const same = compared.length - higher - lower;
    blurb.push(`Compared with a year earlier, the rate was higher in ${higher} and lower in ${lower} of the ${compared.length === 51 ? "50 states and DC" : `${compared.length} states`}${same ? `, and unchanged in ${same}` : ""}.`);
  }
  return blurb;
}
