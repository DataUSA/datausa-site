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
import {acquireUpstreamSlot, UpstreamBusyError} from "@/lib/api/limit";
import {currentScope, noteFetch} from "@/lib/api/upstream-scope";
import {currentWarm, type WarmRelease, type WarmResponse} from "@/lib/api/warm-scope";

export {normalizeTesseractUrl};

export const TESSERACT_URL = (process.env.NEXT_PUBLIC_TESSERACT_URL ?? "https://api-ohio.datausa.io/").replace(/\/?$/, "/");
export const GEOSERVICE_URL = (process.env.GEOSERVICE_URL ?? "https://geoservice.datausa.io/api/").replace(/\/?$/, "/");

const DEFAULT_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS ?? 20000);

export interface FetchResult<T = TesseractResponse> {
  url: string;
  data: T | null;
  status: number;
  error?: string;
  /** Why it failed: an HTTP error status, a timeout, the upstream limiter dropping it, the network, or an unreadable body. */
  failure?: "http" | "timeout" | "limiter" | "network" | "parse";
  durationMs: number;
}

/**
 * Uncached fetch with timeout; never throws. On the server it first waits for a request slot of the
 * URL's host (`src/lib/api/limit.ts`); the timeout runs from when the request is sent.
 */
export async function fetchJsonRaw<T = TesseractResponse>(url: string): Promise<FetchResult<T>> {
  const result = await fetchJsonRawOnce<T>(url);
  // a warm run sends many requests at once: a host that sheds load (429) is asked again, a little
  // later, instead of leaving the report incomplete (live renders are unchanged)
  if (result.status === 429 && currentWarm()) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
      const again = await fetchJsonRawOnce<T>(url);
      if (again.status !== 429) return again;
    }
  }
  return result;
}

async function fetchJsonRawOnce<T>(url: string): Promise<FetchResult<T>> {
  const started = performance.now();
  // a batched warm run (`src/lib/api/warm-scope.ts`) may already hold the answer
  const warm = currentWarm();
  const held = warm ? await warm.lookup(url) : undefined;
  if (held) return heldResult<T>(url, held, started);
  let release: () => void;
  let warmRelease: WarmRelease | undefined;
  let status = 0;
  let bytes = 0;
  let failed: string | undefined;
  try {
    const warmSlot = warm?.acquire(url);
    if (warmSlot) {
      warmRelease = await warmSlot;
      // the run's answer times start when the request is sent, not while it waited for the slot
      const sentAt = performance.now();
      release = () => warmRelease!({status, ms: performance.now() - sentAt, bytes, error: failed});
    }
    else release = await acquireUpstreamSlot(url);
  }
  catch (error) {
    noteFetch(url, (error as Error).message);
    return {url, data: null, status: 0, error: (error as Error).message, failure: error instanceof UpstreamBusyError ? "limiter" : "network", durationMs: performance.now() - started};
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {signal: controller.signal, headers: {accept: "application/json"}, cache: "no-store"});
    const durationMs = performance.now() - started;
    status = res.status;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      bytes = text.length;
      const error = `HTTP ${res.status}: ${text.slice(0, 300)}`;
      failed = error;
      noteFetch(url, error);
      return {url, data: null, status: res.status, error, failure: "http", durationMs};
    }
    let data: T;
    try {
      if (warmRelease) {
        // the warm run counts bytes; the same parse as `res.json()`
        const text = await res.text();
        bytes = text.length;
        data = JSON.parse(text) as T;
        warm?.keep?.(url, {status: res.status, body: text});
      }
      else data = await res.json() as T;
    }
    catch (error) {
      failed = controller.signal.aborted ? "timeout" : `unreadable response: ${(error as Error).message}`;
      noteFetch(url, (error as Error).message);
      return {url, data: null, status: res.status, error: `unreadable response: ${(error as Error).message}`, failure: controller.signal.aborted ? "timeout" : "parse", durationMs: performance.now() - started};
    }
    noteFetch(url);
    return {url, data, status: res.status, durationMs};
  }
  catch (error) {
    const timedOut = controller.signal.aborted;
    const message = timedOut ? `timed out after ${DEFAULT_TIMEOUT_MS} ms` : (error as Error).message;
    failed = timedOut ? "timeout" : message;
    noteFetch(url, message);
    return {url, data: null, status: 0, error: message, failure: timedOut ? "timeout" : "network", durationMs: performance.now() - started};
  }
  finally {
    clearTimeout(timer);
    release();
  }
}

/** A response held by the warm run, returned as `fetchJsonRaw` returns the same response fetched. */
function heldResult<T>(url: string, held: WarmResponse, started: number): FetchResult<T> {
  const durationMs = performance.now() - started;
  if (held.status < 200 || held.status >= 300) {
    const error = `HTTP ${held.status}: ${held.body.slice(0, 300)}`;
    noteFetch(url, error);
    return {url, data: null, status: held.status, error, failure: "http", durationMs};
  }
  noteFetch(url);
  return {url, data: JSON.parse(held.body) as T, status: held.status, durationMs};
}

/**
 * Cached fetch of a public data API URL. The cache key is the URL itself; entries live under the
 * `tesseract` tag (or `geoservice` for geoservice URLs) and the `data` cache-life profile. Failures
 * are kept for a second only.
 */
async function fetchDataCached<T>(normalized: string): Promise<FetchResult<T>> {
  "use cache";
  cacheTag(normalized.startsWith(GEOSERVICE_URL) ? "geoservice" : "tesseract");
  const result = await fetchJsonRaw<T>(normalized);
  // Do not cache failures for long: let the next request retry. The geoservice answers some errors
  // with a 200 and an `{error}` body.
  const body = result.data as Record<string, unknown> | null;
  if (result.error || (body && typeof body === "object" && !Array.isArray(body) && "error" in body && !("data" in body))) cacheLife("seconds");
  else cacheLife("data");
  return result;
}

/**
 * Fetches a public data API URL through Next's data cache, or directly inside an uncached upstream
 * scope: the report engine, attributes and lookups when Redis holds their results (a second copy in
 * Next's per-worker cache would only take memory). The read is noted in the caller's upstream scope
 * (`src/lib/api/upstream-scope.ts`) after the cached call returns, since a `use cache` function does
 * not see the caller's scope, so a failure (cached or not) keeps whatever the caller computes out of
 * longer-lived caches.
 */
export async function fetchData<T = TesseractResponse>(url: string): Promise<FetchResult<T>> {
  const normalized = normalizeTesseractUrl(url);
  // fetchJsonRaw notes the read itself; a warm run (`warm-scope.ts`) caches in Redis only
  if (currentScope()?.uncached || currentWarm()) return fetchJsonRaw<T>(normalized);
  const result = await fetchDataCached<T>(normalized);
  noteFetch(normalized, result.error);
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
