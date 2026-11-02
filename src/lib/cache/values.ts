/**
 * Member attributes and lookup tables in the shared store, with the generator cache's rules: only
 * successes are stored (nothing upstream failed while computing), tagged with what was read, with a
 * purge-safe write, and coalesced within the worker.
 *
 * The computation runs in an upstream scope that fetches directly (no `use cache` underneath: this
 * is the cache) and records the URLs it read; they become the entry's tags. A cached value read
 * inside another computation passes its tags on, so attributes that read a lookup table are purged
 * with the lookup's cube even when the lookup came from the cache.
 */
import {GEOSERVICE_URL} from "@/lib/api/tesseract";
import {noteFailure, noteTags, withUpstreamScope} from "@/lib/api/upstream-scope";
import {withRedis} from "@/lib/cache/redis";
import {decodeValue, encodeValue, epochSnapshot, jsonProblem, storeEntries} from "@/lib/cache/store";
import {tagForUrl} from "@/lib/cache/tags";

interface Stored<T> {
  o: T;
  t: string[];
}

interface Computed {
  text: string | null;
  value: unknown;
  tags: string[];
  failures: string[];
}

const store = globalThis as typeof globalThis & {__valueCacheInflightV1?: Map<string, Promise<Computed>>};
const inflight: Map<string, Promise<Computed>> = store.__valueCacheInflightV1 ??= new Map();

/** Tags of the URLs a scope read plus its explicit tags, or null when a URL maps to no tag. */
export function scopeTags(urls: Iterable<string>, tags: Iterable<string>): string[] | null {
  const out = new Set(tags);
  for (const url of urls) {
    const tag = tagForUrl(url, GEOSERVICE_URL);
    if (!tag) return null;
    out.add(tag);
  }
  return Array.from(out).sort();
}

/**
 * Returns the value under `key`, computing and storing it on a miss. `owner` (`<profile>|<member>`)
 * is recorded in the tag sets for the warmer. Without Redis it simply computes.
 */
export async function cachedValue<T>(key: string, owner: string, compute: () => Promise<T>): Promise<T> {
  const text = await withRedis("read", client => client.get(key));
  if (text) {
    const stored = decodeValue<Stored<T>>(text);
    noteTags(stored.t);
    return stored.o;
  }
  const epochs = text === null ? await epochSnapshot() : undefined;

  let shared = inflight.get(key);
  if (!shared) {
    shared = (async () => {
      const {value, scope} = await withUpstreamScope(compute, {uncached: true});
      const tags = scopeTags(scope.urls, scope.tags);
      const failures = scope.failures;
      const problem = jsonProblem(value);
      let stored: string | null = null;
      if (!failures.length && tags?.length && !problem && value !== undefined) {
        stored = encodeValue({o: value, t: tags} satisfies Stored<unknown>);
        if (epochs) await storeEntries([{key, value: stored, tags, owner}], epochs);
      }
      else if (problem) console.warn(`[gen-cache] ${key} not stored: ${problem}`);
      return {text: stored, value, tags: tags ?? [], failures};
    })();
    inflight.set(key, shared);
    shared.finally(() => inflight.delete(key)).catch(() => {});
  }
  const result = await shared;
  // the caller's own scope learns what the value depends on, and whether it failed
  noteTags(result.tags);
  result.failures.forEach(f => noteFailure(f));
  return (result.text ? decodeValue<Stored<T>>(result.text).o : result.value) as T;
}
