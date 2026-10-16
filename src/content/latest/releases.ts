/**
 * Release dates for the figures on the latest-data home page, from the BLS 2026 release calendar
 * (https://www.bls.gov/schedule/news_release/current_year.asp). BLS blocks automated reads of its
 * schedule pages, so the dates live here: add the next year's dates when BLS publishes them. A
 * period with no entry simply shows no release date. EIA fuel release dates come from EIA itself.
 */
export type ReleaseKind = "cpi" | "jobs" | "states";

/** Reference month (`YYYY-MM`) → release date (`YYYY-MM-DD`). */
export const RELEASES: Record<ReleaseKind, {name: string; url: string; dates: Record<string, string>}> = {
  cpi: {
    name: "Consumer Price Index",
    url: "https://www.bls.gov/news.release/cpi.nr0.htm",
    dates: {"2026-08": "2026-09-11", "2026-09": "2026-10-14", "2026-10": "2026-11-10", "2026-11": "2026-12-10"}
  },
  jobs: {
    name: "Employment Situation",
    url: "https://www.bls.gov/news.release/empsit.nr0.htm",
    dates: {"2026-09": "2026-10-02", "2026-10": "2026-11-06", "2026-11": "2026-12-04"}
  },
  states: {
    name: "State Employment and Unemployment",
    url: "https://www.bls.gov/news.release/laus.nr0.htm",
    dates: {"2026-09": "2026-10-20"}
  }
};

/** The release date of a reference month, if known. */
export function releaseDate(kind: ReleaseKind, period: string): string | undefined {
  return RELEASES[kind].dates[period];
}

/** The first release on or after `today` (`YYYY-MM-DD`), if one is listed. */
export function nextRelease(kind: ReleaseKind, today: string): {period: string; date: string} | undefined {
  return Object.entries(RELEASES[kind].dates)
    .map(([period, date]) => ({period, date}))
    .filter(r => r.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}
