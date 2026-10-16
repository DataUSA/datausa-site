/**
 * Monthly and weekly time series for the "latest data" home page, with the small calculations its
 * headlines and blurbs need. Pure functions: no fetching, so they can be checked against saved data.
 */

/** One observation. `value` is null where the source has no figure (e.g. October 2025, which the
 *  2025 lapse in appropriations left uncollected). `date` is `YYYY-MM` or `YYYY-MM-DD`. */
export interface Point {date: string; value: number | null; preliminary?: boolean}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "September 2026" for `2026-09`, "12 October 2026" for `2026-10-12`. */
export function dateLabel(date: string, withYear = true): string {
  const [y, m, d] = date.split("-").map(Number);
  const month = MONTHS[m - 1];
  if (d) return withYear ? `${d} ${month} ${y}` : `${d} ${month}`;
  return withYear ? `${month} ${y}` : month;
}

/** The point `months` before a monthly point, or undefined when it is outside the series. */
function monthsBefore(series: Point[], index: number, months: number): Point | undefined {
  const [y, m] = series[index].date.split("-").map(Number);
  const total = y * 12 + (m - 1) - months;
  const key = `${Math.floor(total / 12)}-${String(total % 12 + 1).padStart(2, "0")}`;
  for (let i = index - 1; i >= 0; i--) {
    if (series[i].date === key) return series[i];
    if (series[i].date < key) break;
  }
  return undefined;
}

/** Percent change over `months` (12 for the annual rate) for every point that has a base. */
export function percentChange(series: Point[], months = 12): Point[] {
  return series.map((point, i) => {
    const base = monthsBefore(series, i, months);
    const value = point.value !== null && base?.value ? (point.value / base.value - 1) * 100 : null;
    return {date: point.date, value, preliminary: point.preliminary};
  });
}

/** Month-on-month difference of a level series (e.g. payroll jobs added). */
export function difference(series: Point[]): Point[] {
  return series.map((point, i) => {
    const base = monthsBefore(series, i, 1);
    const value = point.value !== null && base?.value !== null && base?.value !== undefined ? point.value - base.value : null;
    return {date: point.date, value, preliminary: point.preliminary};
  });
}

/** The latest point with a value. */
export function latest(series: Point[]): Point | undefined {
  for (let i = series.length - 1; i >= 0; i--) if (series[i].value !== null) return series[i];
  return undefined;
}

/** The latest point with a value before `date`. */
export function previous(series: Point[], date: string): Point | undefined {
  for (let i = series.length - 1; i >= 0; i--) if (series[i].date < date && series[i].value !== null) return series[i];
  return undefined;
}

/** The point with this date, if it has a value. */
export function at(series: Point[], date: string): Point | undefined {
  const point = series.find(p => p.date === date);
  return point && point.value !== null ? point : undefined;
}

/**
 * How unusual the latest value is: the most recent earlier point at least as high (direction "up")
 * or as low ("down"). Returns `{since}` with that point, `{record: true}` when no earlier point in
 * the series reaches it, or null when the previous point already did (nothing to say).
 */
export function extremeSince(series: Point[], direction: "up" | "down"): {since?: Point; record?: boolean; months?: number} | null {
  const values = series.filter(p => p.value !== null);
  const last = values[values.length - 1];
  if (!last || values.length < 2) return null;
  const beats = (p: Point) => direction === "up" ? (p.value as number) >= (last.value as number) : (p.value as number) <= (last.value as number);
  const before = values[values.length - 2];
  if (beats(before)) return null;
  for (let i = values.length - 3; i >= 0; i--) {
    if (beats(values[i])) return {since: values[i], months: values.length - 1 - i};
  }
  return {record: true};
}

/** Mean of the last `count` values (skipping gaps). */
export function trailingMean(series: Point[], count: number): number | null {
  const values = series.filter(p => p.value !== null).slice(-count).map(p => p.value as number);
  return values.length === count ? values.reduce((a, b) => a + b, 0) / count : null;
}

/** The first date of the run of consecutive months (ending now) where `test` holds for both series. */
export function runStart(a: Point[], b: Point[], test: (x: number, y: number) => boolean): string | null {
  const byDate = new Map(b.map(p => [p.date, p.value]));
  let start: string | null = null;
  for (let i = a.length - 1; i >= 0; i--) {
    const x = a[i].value;
    const y = byDate.get(a[i].date);
    if (x === null || y === null || y === undefined) {
      if (start === null) continue; // the latest months may not have both figures yet
      if (x === null && y === null) continue; // a gap in both (October 2025) does not break the run
      break;
    }
    if (!test(x, y)) break;
    start = a[i].date;
  }
  return start;
}

/** The points within the last `months` months of the latest point (for sparklines). */
export function lastMonths(series: Point[], months: number): Point[] {
  const end = latest(series);
  if (!end) return [];
  const [y, m] = end.date.split("-").map(Number);
  const total = y * 12 + (m - 1) - months + 1;
  const from = `${Math.floor(total / 12)}-${String(total % 12 + 1).padStart(2, "0")}`;
  return series.filter(p => p.date >= from && p.date <= end.date);
}
