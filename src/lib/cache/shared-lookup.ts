/**
 * Lookups shared by every worker: a value built from a few heavy Tesseract queries and read by many
 * pages, such as the level figures behind the landing pages and each report's "in context" section
 * (`src/lib/landing/data.ts`: the population of every place is a 2.5 MB answer) and the university
 * figures (`src/lib/dimensions/universities.ts`).
 *
 * Kept in each worker's memory alone, every worker misses at once after a deploy, a restart or a
 * purge and sends the same heavy queries (on penn, 9 workers with up to 8 queries in flight each).
 * With Redis:
 *
 * - **Stored like the generator outputs** (`store.ts`): tagged with the cubes the computation read,
 *   written only if no purge of those cubes ran meanwhile, deleted by a purge of any of them. A
 *   deploy or restart reads the value back instead of querying again.
 * - **One worker computes it.** The first to miss takes `lock:<key>` (`SET NX PX`) and runs the
 *   queries; the others poll the lock and read the entry once it is there. They compute it
 *   themselves only if the lock expires or is released without an entry.
 * - **Failures are not stored.** The worker that failed leaves a `failed|…` mark in the lock for
 *   `LOOKUP_FAILED_MS` (10 s), and the workers that meet it answer with the lookup's fallback (no
 *   figures) instead of sending the same failing queries.
 * - **Memory**: each worker keeps the value for an hour and checks the purge counters of its cubes
 *   every 30 s, so a purge reaches every worker within that time.
 *
 * - **Keyed by the code that builds it**: the generator manifest hashes the modules of each family
 *   of lookups (`sharedLookups` in `scripts/cache/build-manifest.ts`), so a deploy that changes how
 *   a lookup is queried or parsed reads none of the copies the old code stored. Nobody has to
 *   remember to bump a version.
 *
 * Without Redis (not configured, down, or its circuit breaker open), or without a manifest to key it
 * by, each worker computes the value itself, through Next's data cache, and keeps it for an hour
 * (30 s when part of it failed).
 */
import {createHash, randomUUID} from "node:crypto";
import {noteFailure, noteTags, withUpstreamScope} from "@/lib/api/upstream-scope";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisClient, redisConfigured, withRedis} from "@/lib/cache/redis";
import {EPOCH_KEY, epochSnapshot, storeEntries} from "@/lib/cache/store";
import {scopeTags} from "@/lib/cache/values";

export interface SharedLookupSpec<T> {
  /** Redis key, from `sharedLookupKey`. */
  key: string;
  /** False keeps the value out of Redis (no code version to key it by): each worker computes it. */
  shared?: boolean;
  /** Name in the logs ("Place population"). */
  label: string;
  /** Builds the value. Upstream failures inside it are noted by the fetch helpers (`upstream-scope.ts`). */
  compute: () => Promise<T>;
  /** The value as plain JSON (maps as objects), and back. */
  encode: (value: T) => unknown;
  decode: (stored: unknown) => T;
  /** Answered while a failure is remembered or when the computation throws: the lookup without figures. */
  fallback: T;
}

/** How long a worker keeps a value in memory. */
const MEMORY_MS = 60 * 60 * 1000;
/** How often a value in memory is checked against the purge counters of its cubes. */
const CHECK_MS = 30 * 1000;
/** Without Redis, how soon a value with a failed part is computed again. */
const LOCAL_RETRY_MS = 30 * 1000;
/** How long the other workers skip a lookup that failed. */
const FAILED_MS = Number(process.env.LOOKUP_FAILED_MS ?? 10_000);
/**
 * How long a worker may hold the lock (and the others wait for it). Two queries of up to 20 s each,
 * the latest period then the earlier one, plus a wait for a request slot.
 */
const LOCK_MS = Number(process.env.LOOKUP_LOCK_MS ?? 90_000);
const POLL_MS = 250;
/** Deadline of a read of a stored value, in `withRedis` units (its read deadline per 50 keys): a value can be a few MB. */
const VALUE_READ_SIZE = 200;
/** How long a lookup waits for a worker's first connection to Redis, rather than querying without it. */
const CONNECT_WAIT_MS = 2000;
const FAILED_PREFIX = "failed|";

/**
 * The version of the code behind a family of lookups (`levels`, `universities`), from the generator
 * manifest; undefined without one, and the lookup then stays out of Redis: a stored copy must never
 * be read by code it was not built with. Not part of `GeneratorManifest` on purpose: `manifest.ts` is
 * hashed into the attribute versions, and editing it would re-key every member's attributes.
 */
export function lookupCodeVersion(family: string): string | undefined {
  return (generatorManifest() as {sharedLookups?: Record<string, string>} | null)?.sharedLookups?.[family];
}

/**
 * The key of a lookup: its name (no `|`: tag sets list entries as `<key>|<owner>`) and a hash of
 * everything that decides what it holds (the queries, a version of the code that reads them).
 */
export function sharedLookupKey(name: string, version: unknown): string {
  return `lookup:${name.replace(/\|/g, "/")}:${createHash("sha256").update(JSON.stringify(version)).digest("hex").slice(0, 16)}`;
}

interface Stored {
  /** The encoded value. */
  o: unknown;
  /** Its tags, and the purge counter of each when it was computed. */
  t: string[];
  e: string[];
}

interface Loaded<T> {
  value: T;
  /** Kept for `MEMORY_MS`, or for `retryMs`. */
  retryMs?: number;
  /** The tags of a stored value and their purge counters, for the check in memory. */
  tags?: string[];
  epochs?: string[];
}

interface Held {
  value: Promise<unknown>;
  expires: number;
  checkedAt: number;
  tags?: string[];
  epochs?: string[];
}

// one map per process, shared by every module graph (pages, route handlers)
const store = globalThis as typeof globalThis & {__sharedLookupsV1?: Map<string, Held>};
const memory: Map<string, Held> = store.__sharedLookupsV1 ??= new Map();

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const seconds = (since: number) => ((performance.now() - since) / 1000).toFixed(1);

/** The lookup: from this worker's memory, from Redis, from the worker computing it, or computed here. */
export function sharedLookup<T>(spec: SharedLookupSpec<T>): Promise<T> {
  const now = Date.now();
  const held = memory.get(spec.key);
  if (held && held.expires > now) {
    if (held.tags && now - held.checkedAt > CHECK_MS) {
      held.checkedAt = now;
      void recheck(spec.key, held);
    }
    return held.value as Promise<T>;
  }
  // set before anything is awaited: concurrent callers in this worker share the load
  const entry: Held = {value: Promise.resolve(), expires: now + MEMORY_MS, checkedAt: now};
  entry.value = (redisConfigured() && spec.shared !== false ? loadShared(spec) : computeHere(spec)).then(
    loaded => {
      if (loaded.retryMs !== undefined) entry.expires = Date.now() + loaded.retryMs;
      entry.tags = loaded.tags;
      entry.epochs = loaded.epochs;
      entry.checkedAt = Date.now();
      return loaded.value;
    },
    (error: unknown) => {
      entry.expires = 0;
      console.warn(`[lookups] ${spec.label}: ${(error as Error)?.message ?? error}`);
      noteFailure(`${spec.label}: ${(error as Error)?.message ?? error}`);
      return spec.fallback;
    }
  );
  memory.set(spec.key, entry);
  return entry.value as Promise<T>;
}

/** Drops the copy in memory when a cube it read was purged since it was computed. */
async function recheck(key: string, held: Held) {
  const current = await withRedis("read", client => client.hmget(EPOCH_KEY, ...held.tags!));
  if (!current) return;
  if (current.some((epoch, i) => (epoch ?? "0") !== held.epochs?.[i]) && memory.get(key) === held) memory.delete(key);
}

/** Without Redis: computed by this worker, through Next's data cache, as every worker did before. */
async function computeHere<T>(spec: SharedLookupSpec<T>): Promise<Loaded<T>> {
  const {value, scope} = await withUpstreamScope(spec.compute);
  return scope.failures.length ? {value, retryMs: LOCAL_RETRY_MS} : {value};
}

/** Waits for this worker's first connection to Redis, so that the first pages after a start share their lookups too. */
async function connected(): Promise<void> {
  const client = redisClient();
  if (!client || !["wait", "connecting", "connect"].includes(client.status)) return;
  await new Promise<void>(resolve => {
    const done = () => { clearTimeout(timer); client.off("ready", done); resolve(); };
    const timer = setTimeout(done, CONNECT_WAIT_MS);
    client.once("ready", done);
  });
}

function fromStore<T>(spec: SharedLookupSpec<T>, text: string): Loaded<T> | null {
  try {
    const stored = JSON.parse(text) as Stored;
    noteTags(stored.t);
    return {value: spec.decode(stored.o), tags: stored.t, epochs: stored.e};
  }
  catch (error) {
    console.warn(`[lookups] ${spec.label}: unreadable entry (${(error as Error).message}), computing it again`);
    return null;
  }
}

/** The fallback, while the failure another worker met is remembered. */
function skipped<T>(spec: SharedLookupSpec<T>): Loaded<T> {
  noteFailure(`${spec.label}: failed in another worker a moment ago`);
  return {value: spec.fallback, retryMs: FAILED_MS};
}

async function loadShared<T>(spec: SharedLookupSpec<T>, attempt = 0): Promise<Loaded<T>> {
  if (attempt === 0) await connected();
  const lockKey = `lock:${spec.key}`;

  // 1. the stored value
  const text = await withRedis("read", client => client.get(spec.key), VALUE_READ_SIZE);
  if (text === undefined) return computeHere(spec); // Redis unavailable
  if (text) {
    const hit = fromStore(spec, text);
    if (hit) return hit;
  }

  // 2. the lock, or the failure remembered in it
  const token = `${process.pid}:${randomUUID()}`;
  const replies = await withRedis("write", client => client.pipeline()
    .set(lockKey, token, "PX", LOCK_MS, "NX")
    .get(lockKey)
    .exists(spec.key)
    .exec(), 3);
  if (!replies || replies.some(([error]) => error)) return computeHere(spec);
  const [[, acquired], [, holder], [, exists]] = replies;
  if (acquired === "OK") {
    // stored by another worker between the read and the lock: read it
    if (exists === 1 && attempt < 2) {
      await release(lockKey, token);
      return loadShared(spec, attempt + 1);
    }
    return computeShared(spec, lockKey, token);
  }
  if (typeof holder === "string" && holder.startsWith(FAILED_PREFIX)) return skipped(spec);

  // 3. another worker is computing it: wait for its entry
  const deadline = Date.now() + LOCK_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    const state = await withRedis("read", client => client.pipeline().exists(spec.key).get(lockKey).exec(), 2);
    if (!state || state.some(([error]) => error)) return computeHere(spec);
    const [[, stored], [, lock]] = state;
    if (typeof lock === "string" && lock.startsWith(FAILED_PREFIX)) return skipped(spec);
    // stored (read it), or released without an entry (take the lock and compute it)
    if (stored === 1 || lock === null) return attempt < 2 ? loadShared(spec, attempt + 1) : computeHere(spec);
  }
  // the lock outlived the worker that held it
  return attempt < 2 ? loadShared(spec, attempt + 1) : computeHere(spec);
}

/** Computed by this worker, which holds the lock: the result is stored, or the failure remembered. */
async function computeShared<T>(spec: SharedLookupSpec<T>, lockKey: string, token: string): Promise<Loaded<T>> {
  // the purge counters before any query: a purge during the computation keeps its result out
  const epochs = await epochSnapshot();
  const started = performance.now();
  let computed: Awaited<ReturnType<typeof withUpstreamScope<T>>>;
  try {
    // straight to the API (Redis holds the result; no second copy in Next's per-worker data cache)
    computed = await withUpstreamScope(spec.compute, {uncached: true});
  }
  catch (error) {
    await release(lockKey, token, `${FAILED_PREFIX}${(error as Error)?.message ?? error}`);
    throw error;
  }
  const {value, scope} = computed;
  if (scope.failures.length) {
    await release(lockKey, token, `${FAILED_PREFIX}${scope.failures[0].slice(0, 300)}`);
    console.warn(`[lookups] ${spec.label}: failed after ${seconds(started)} s, not stored; skipped for ${FAILED_MS / 1000} s (${scope.failures[0].slice(0, 200)})`);
    return {value, retryMs: FAILED_MS};
  }
  const tags = scopeTags(scope.urls, scope.tags);
  let written = 0;
  let tagEpochs: string[] = [];
  if (tags?.length && epochs) {
    tagEpochs = tags.map(t => epochs[t] ?? "0");
    const text = JSON.stringify({o: spec.encode(value), t: tags, e: tagEpochs} satisfies Stored);
    written = await storeEntries([{key: spec.key, value: text, tags, owner: `lookup|${spec.key}`}], epochs);
  }
  await release(lockKey, token);
  console.log(`[lookups] ${spec.label}: computed in ${seconds(started)} s (${scope.urls.size} ${scope.urls.size === 1 ? "query" : "queries"})${written ? ", shared" : ", not shared"}`);
  if (written) return {value, tags: tags!, epochs: tagEpochs};
  // a purge ran during the computation (the value may predate it) or Redis failed: compute it again soon
  return tags?.length ? {value, retryMs: CHECK_MS} : {value};
}

const RELEASE = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
if ARGV[2] == '' then redis.call('DEL', KEYS[1]) else redis.call('SET', KEYS[1], ARGV[2], 'PX', ARGV[3]) end
return 1
`;

/** Releases the lock if this worker still holds it, leaving a failure mark in its place when given one. */
async function release(lockKey: string, token: string, mark = "") {
  await withRedis("write", client => client.eval(RELEASE, 1, lockKey, token, mark, FAILED_MS));
}
