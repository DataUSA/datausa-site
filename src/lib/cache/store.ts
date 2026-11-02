/**
 * The shared value store in Redis: entries, their tag sets and the purge counters.
 *
 *   <entry key>        the value, as JSON, with a TTL (`CACHE_TTL_DAYS`, default 30: a safety net;
 *                      purges are what invalidate)
 *   cube:<name>        set of the entries that read a cube (`tag:geoservice`, `tag:dimensions`,
 *                      `tag:external-data` for the other tags); each member is
 *                      `<entry key>|<profile>|<member id>` so a purge knows which reports to re-warm
 *   cube-epoch         hash: tag -> number of purges of that tag
 *   cache:tags         set of every tag ever written (purges report names never seen)
 *
 * Tag sets, the epoch hash and the tag registry have no TTL, so `maxmemory-policy volatile-lru`
 * evicts entries only, never the bookkeeping that purges rely on.
 *
 * Purge-safe writes: a computation reads the epochs before fetching (`epochSnapshot`) and writes its
 * entry with `storeEntries`, a Lua script that checks every tag's epoch is unchanged and only then
 * sets the entry and adds it to its tag sets, atomically. A render that was fetching while a purge
 * ran therefore cannot write the data it read before the purge back.
 */
import type Redis from "ioredis";
import {withRedis} from "@/lib/cache/redis";
import type {Variables} from "@/lib/reports/types";

export const EPOCH_KEY = "cube-epoch";
export const TAG_REGISTRY_KEY = "cache:tags";
export const TTL_MS = Math.round(Number(process.env.CACHE_TTL_DAYS ?? 30) * 86_400_000);

const STORE_SCRIPT = `
for i = 4, #KEYS do
  local current = redis.call('HGET', KEYS[2], KEYS[i])
  if not current then current = '0' end
  if current ~= ARGV[i] then return 0 end
end
redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2])
for i = 4, #KEYS do
  redis.call('SADD', KEYS[i], ARGV[3])
  redis.call('SADD', KEYS[3], KEYS[i])
end
return 1
`;

type StoreClient = Redis & {datausaStore: (...args: (string | number)[]) => Promise<number>};

function withScript(client: Redis): StoreClient {
  const c = client as StoreClient;
  if (!c.datausaStore) client.defineCommand("datausaStore", {lua: STORE_SCRIPT});
  return c;
}

export type EpochSnapshot = Record<string, string>;

/** Every tag's purge counter, read before fetching. Undefined when Redis is unavailable. */
export async function epochSnapshot(): Promise<EpochSnapshot | undefined> {
  return withRedis("read", client => client.hgetall(EPOCH_KEY));
}

export interface EntryWrite {
  key: string;
  value: string;
  tags: string[];
  /** `<profile>|<member id>`, stored in the tag sets for the warmer. */
  owner: string;
}

/** Writes entries whose tags were not purged since `epochs` was read. Returns how many were written. */
export async function storeEntries(entries: EntryWrite[], epochs: EpochSnapshot): Promise<number> {
  if (!entries.length) return 0;
  const result = await withRedis("write", async client => {
    const pipeline = withScript(client).pipeline() as unknown as {datausaStore: (...args: (string | number)[]) => void; exec: () => Promise<[Error | null, unknown][] | null>};
    for (const e of entries) {
      pipeline.datausaStore(3 + e.tags.length, e.key, EPOCH_KEY, TAG_REGISTRY_KEY, ...e.tags, e.value, TTL_MS, `${e.key}|${e.owner}`, ...e.tags.map(t => epochs[t] ?? "0"));
    }
    const replies = await pipeline.exec();
    return (replies ?? []).filter(([error, reply]) => !error && reply === 1).length;
  }, entries.length);
  return result ?? 0;
}


/** Stands for `undefined` in stored JSON (a value no content produces: it starts with a NUL). */
const UNDEFINED = "\u0000undefined";

/**
 * Where `value` would not survive the store's JSON round trip unchanged, or null when it does.
 * `undefined` is kept (see `encodeValue`); functions, non-finite numbers, array holes, dates, maps,
 * sets and other class instances are not, and such a value is left uncached rather than coerced.
 */
export function jsonProblem(value: unknown, path = ""): string | null {
  if (value === null || value === undefined) return null;
  switch (typeof value) {
    case "string":
      return value === UNDEFINED ? `${path || "value"} is the undefined marker` : null;
    case "boolean":
      return null;
    case "number":
      return Number.isFinite(value) ? null : `${path || "value"} is ${value}`;
    case "object":
      break;
    default:
      return `${path || "value"} is a ${typeof value}`;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!(i in value)) return `${path}[${i}] is a hole`;
      const problem = jsonProblem(value[i], `${path}[${i}]`);
      if (problem) return problem;
    }
    return null;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return `${path || "value"} is a ${proto?.constructor?.name ?? "class instance"}`;
  if ("toJSON" in (value as object)) return `${path || "value"} has toJSON`;
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const problem = jsonProblem(v, path ? `${path}.${key}` : key);
    if (problem) return problem;
  }
  return null;
}

/**
 * JSON of a value that passed `jsonProblem`, with `undefined` (in objects and arrays) written as a
 * marker so `decodeValue` restores it in place: a key set to `undefined` stays a key, in its
 * position, exactly as the uncached render has it.
 */
export function encodeValue(value: unknown): string {
  return JSON.stringify(value, (_, v) => v === undefined ? UNDEFINED : v);
}

/** Restores a value written by `encodeValue`. */
export function decodeValue<T>(text: string): T {
  const restore = (v: unknown): unknown => {
    if (v === UNDEFINED) return undefined;
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) v[i] = restore(v[i]);
    }
    else if (v && typeof v === "object") {
      for (const k of Object.keys(v)) (v as Record<string, unknown>)[k] = restore((v as Record<string, unknown>)[k]);
    }
    return v;
  };
  return restore(JSON.parse(text)) as T;
}

/** A generator output as stored, with its generator, member and profile for tracing. */
export function encodeOutput(output: Variables, meta: Record<string, unknown>): string {
  return encodeValue({...meta, o: output});
}

/** Restores an output stored by `encodeOutput`. */
export function decodeOutput(text: string): {output: Variables; meta: Record<string, unknown>} {
  const {o, ...meta} = decodeValue<{o: Variables} & Record<string, unknown>>(text);
  return {output: o, meta};
}
