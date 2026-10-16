/**
 * Weekly U.S. retail gasoline and diesel prices from the Energy Information Administration. EIA's
 * API needs a key, so this reads the public history tables behind the Gasoline and Diesel Fuel
 * Update (https://www.eia.gov/petroleum/gasdiesel/), which carry the whole weekly series and the
 * release dates. If EIA changes the page layout the parse finds no rows and the caller hides the
 * fuel figures rather than showing wrong ones.
 */
import type {Point} from "@/lib/latest/series";

const TIMEOUT_MS = 20000;

/** EIA series ids: U.S. regular gasoline and U.S. on-highway diesel, dollars per gallon. */
export const EIA_SERIES = {gasoline: "EMM_EPMR_PTE_NUS_DPG", diesel: "EMD_EPD2D_PTE_NUS_DPG"} as const;

export interface EiaWeekly {series: Point[]; released?: string; nextRelease?: string}

const MONTHS: Record<string, string> = {Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"};

/** `10/14/2026` as `2026-10-14`. */
function isoDate(text: string | undefined): string | undefined {
  const m = text?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[1]}-${m[2]}` : undefined;
}

/** Parses the weekly history table: one row per month (`2026-Oct`), then date/value cell pairs. */
export function parseEiaWeekly(html: string): EiaWeekly {
  const series: Point[] = [];
  for (const row of html.split(/<tr[^>]*>/i)) {
    const month = row.match(/class=['"]B6['"][^>]*>(?:&nbsp;|\s)*(\d{4})-([A-Z][a-z]{2})/);
    if (!month || !MONTHS[month[2]]) continue;
    const year = Number(month[1]);
    const cells = [...row.matchAll(/class=['"](B5|B3)['"][^>]*>([^<]*)</g)].map(c => [c[1], c[2].replace(/&nbsp;/g, " ").trim()]);
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const [dateClass, day] = cells[i];
      const [valueClass, value] = cells[i + 1];
      const dm = day.match(/^(\d{2})\/(\d{2})$/);
      if (dateClass !== "B5" || valueClass !== "B3" || !dm) continue;
      // A week listed under January can carry a December date from the year before, and vice versa.
      const y = dm[1] === "12" && MONTHS[month[2]] === "01" ? year - 1 : year;
      const number = Number(value);
      series.push({date: `${y}-${dm[1]}-${dm[2]}`, value: value && Number.isFinite(number) ? number : null});
    }
  }
  series.sort((a, b) => a.date.localeCompare(b.date));
  return {
    series,
    released: isoDate(html.match(/Release Date:\s*([\d/]+)/)?.[1]),
    nextRelease: isoDate(html.match(/Next Release Date:\s*([\d/]+)/)?.[1])
  };
}

/** Fetches one weekly price series. Throws on a failed request or an unreadable page. */
export async function fetchEiaWeekly(series: string): Promise<EiaWeekly> {
  const url = `https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=${series}&f=W`;
  const res = await fetch(url, {headers: {accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; DataUSA/2026; +https://datausa.io)"}, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS)});
  if (!res.ok) throw new Error(`EIA: HTTP ${res.status}`);
  const parsed = parseEiaWeekly(await res.text());
  if (parsed.series.length < 52) throw new Error(`EIA: could not read the ${series} table`);
  return parsed;
}
