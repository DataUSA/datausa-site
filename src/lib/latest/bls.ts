/**
 * Bureau of Labor Statistics public data API (https://www.bls.gov/developers/). Without a key it
 * uses version 1: 25 series and 10 years per request, 25 requests a day per IP address. With
 * `BLS_API_KEY` (free registration) it uses version 2: 50 series, 20 years, 500 requests a day.
 * The key is read from the environment only and never sent anywhere but api.bls.gov.
 */
import type {Point} from "@/lib/latest/series";

const TIMEOUT_MS = 20000;

interface BlsObservation {year: string; period: string; value: string; footnotes?: {code?: string; text?: string}[]}
interface BlsResponse {status: string; message?: string[]; Results?: {series?: {seriesID: string; data: BlsObservation[]}[]}}

/** Monthly observations (`M01`–`M12`) as points, oldest first. `M13` (annual average) is dropped. */
function toPoints(data: BlsObservation[]): Point[] {
  return data
    .filter(d => /^M(0[1-9]|1[0-2])$/.test(d.period))
    .map(d => {
      const value = Number(d.value);
      return {
        date: `${d.year}-${d.period.slice(1)}`,
        value: d.value.trim() === "-" || !Number.isFinite(value) ? null : value,
        preliminary: (d.footnotes ?? []).some(f => f.code === "P")
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetches the series for the last `years` years (capped by the API version). Throws when BLS does
 * not answer or refuses the request (for example after the daily limit), so callers can keep the
 * last good result instead of caching an empty one.
 */
export async function fetchBlsSeries(ids: string[], years: number): Promise<Map<string, Point[]>> {
  const key = process.env.BLS_API_KEY?.trim();
  const perRequest = key ? 50 : 25;
  const span = Math.min(years, key ? 20 : 10);
  const end = new Date().getUTCFullYear();
  const url = `https://api.bls.gov/publicAPI/${key ? "v2" : "v1"}/timeseries/data/`;
  const out = new Map<string, Point[]>();
  for (let i = 0; i < ids.length; i += perRequest) {
    const body: Record<string, unknown> = {seriesid: ids.slice(i, i + perRequest), startyear: String(end - span + 1), endyear: String(end)};
    if (key) body.registrationkey = key;
    const res = await fetch(url, {
      method: "POST",
      headers: {"content-type": "application/json", accept: "application/json"},
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    if (!res.ok) throw new Error(`BLS API: HTTP ${res.status}`);
    const json = await res.json() as BlsResponse;
    if (json.status !== "REQUEST_SUCCEEDED") throw new Error(`BLS API: ${json.status} ${(json.message ?? []).join(" ")}`.trim());
    for (const series of json.Results?.series ?? []) out.set(series.seriesID, toPoints(series.data));
  }
  return out;
}
