/**
 * Records what a piece of server work read from upstream: the URLs it fetched, the tags of the
 * data it used, and whether any of it failed. A cache layer runs its computation inside a scope
 * and stores the result only when the scope saw no failure (a geoservice outage inside the member
 * attributes must not be cached for days), tagged with what the scope read.
 *
 * Scopes nest: a note reaches the current scope and every scope around it, so a lookup that fails
 * inside the attributes of a member also keeps the attributes out of the cache. Next's `use cache`
 * runs its function in a clean async context, so a scope opened outside a `use cache` function is
 * not visible inside it; callers note the result after the cached call returns instead (see
 * `fetchData`).
 */
import {AsyncLocalStorage} from "node:async_hooks";

export interface UpstreamScope {
  /** Fetch directly instead of through Next's `use cache`: the caller caches the result itself (Redis). */
  uncached: boolean;
  /** Every URL read, absolute. */
  urls: Set<string>;
  /** Tags noted explicitly (data read without a URL: SQLite, third-party feeds, cached values). */
  tags: Set<string>;
  /** One line per failed read. */
  failures: string[];
  parent?: UpstreamScope;
}

// one storage per process, shared by every module graph (pages, route handlers, instrumentation)
const store = globalThis as typeof globalThis & {__upstreamScopeV1?: AsyncLocalStorage<UpstreamScope>};
const storage = store.__upstreamScopeV1 ??= new AsyncLocalStorage<UpstreamScope>();

export function currentScope(): UpstreamScope | undefined {
  return storage.getStore();
}

/** Runs `fn` in a new scope (nested in the current one) and returns its value with what it read. */
export async function withUpstreamScope<T>(fn: () => Promise<T>, options: {uncached?: boolean} = {}): Promise<{value: T; scope: UpstreamScope}> {
  const parent = storage.getStore();
  const scope: UpstreamScope = {uncached: options.uncached ?? parent?.uncached ?? false, urls: new Set(), tags: new Set(), failures: [], parent};
  const value = await storage.run(scope, fn);
  return {value, scope};
}

function each(update: (scope: UpstreamScope) => void) {
  for (let scope = storage.getStore(); scope; scope = scope.parent) update(scope);
}

/** Notes a read of `url`; `error` marks it failed. */
export function noteFetch(url: string, error?: string) {
  each(scope => {
    scope.urls.add(url);
    if (error) scope.failures.push(`${url}: ${error.slice(0, 200)}`);
  });
}

/** Notes data read without a URL (`tag:dimensions`, `tag:external-data`) or the tags of a cached value. */
export function noteTags(tags: Iterable<string>) {
  const list = Array.from(tags);
  each(scope => list.forEach(t => scope.tags.add(t)));
}

/** Notes a failure that has no URL (a third-party feed that answered with an error, for example). */
export function noteFailure(reason: string) {
  each(scope => { scope.failures.push(reason); });
}
