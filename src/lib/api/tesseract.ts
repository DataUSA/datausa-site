/**
 * Typed client for the existing Data USA Tesseract OLAP API.
 *
 * Responsibilities: build valid request URLs, fetch and parse JSON, normalise legacy URL variants,
 * cache responses with Cache Components (`use cache`) under the `tesseract` tag so dataset releases
 * can be propagated with `revalidateTag`, and surface errors as values rather than exceptions so a
 * single failing query never breaks a whole report (matching the legacy behaviour).
 */
import {cacheLife, cacheTag} from "next/cache";
import type {TesseractResponse} from "@/lib/reports/types";
import {normalizeTesseractUrl} from "@/lib/api/urls";

export {normalizeTesseractUrl};

export const TESSERACT_URL = (process.env.NEXT_PUBLIC_TESSERACT_URL ?? "https://api-ohio.datausa.io/").replace(/\/?$/, "/");
export const GEOSERVICE_URL = (process.env.GEOSERVICE_URL ?? "https://geoservice.datausa.io/api/").replace(/\/?$/, "/");

const DEFAULT_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 20000);

export interface FetchResult<T = TesseractResponse> {
  url: string;
  data: T | null;
  status: number;
  error?: string;
  durationMs: number;
}

/** Uncached fetch with timeout; never throws. */
export async function fetchJsonRaw<T = TesseractResponse>(url: string): Promise<FetchResult<T>> {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {signal: controller.signal, headers: {accept: "application/json"}, cache: "no-store"});
    const durationMs = performance.now() - started;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {url, data: null, status: res.status, error: `HTTP ${res.status}: ${text.slice(0, 300)}`, durationMs};
    }
    const data = await res.json() as T;
    return {url, data, status: res.status, durationMs};
  }
  catch (error) {
    return {url, data: null, status: 0, error: (error as Error).message, durationMs: performance.now() - started};
  }
  finally {
    clearTimeout(timer);
  }
}

/**
 * Cached fetch of a public data API URL. The cache key is the URL itself; entries live under the
 * `tesseract` tag (or `geoservice` for geoservice URLs) and the `data` cache-life profile.
 */
export async function fetchData<T = TesseractResponse>(url: string): Promise<FetchResult<T>> {
  "use cache";
  const normalized = normalizeTesseractUrl(url);
  cacheTag(normalized.startsWith(GEOSERVICE_URL) ? "geoservice" : "tesseract");
  cacheLife("data");
  const result = await fetchJsonRaw<T>(normalized);
  if (result.error) {
    // Do not cache failures for long: let the next request retry.
    cacheLife("seconds");
  }
  return result;
}

/** Convenience: fetches `data.jsonrecords` for the given cube query. */
export function tesseractDataUrl(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  if (!search.has("locale")) search.set("locale", "en");
  return `${TESSERACT_URL}tesseract/data.jsonrecords?${search.toString()}`;
}
