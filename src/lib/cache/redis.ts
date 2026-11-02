/**
 * The Redis connection of this worker (one per process), for the generator cache, the purge and the
 * warmer. `REDIS_URL` unset means no Redis: `redis()` returns null and every caller falls back to
 * rendering without the shared cache.
 *
 * Redis must never fail a page. Every command goes through `withRedis`, which gives it a deadline
 * (`REDIS_READ_TIMEOUT_MS`, default 50 ms, for reads; `REDIS_WRITE_TIMEOUT_MS`, default 1 s, for
 * writes) and feeds a circuit breaker: after `BREAKER_FAILURES` consecutive errors or timeouts the
 * cache is skipped for `BREAKER_COOLDOWN_MS`, then one command is let through to probe it. Errors are
 * logged at most once a minute, with how many were suppressed.
 */
import Redis from "ioredis";

const READ_TIMEOUT_MS = Number(process.env.REDIS_READ_TIMEOUT_MS ?? 50);
const WRITE_TIMEOUT_MS = Number(process.env.REDIS_WRITE_TIMEOUT_MS ?? 1000);
const BREAKER_FAILURES = 5;
const BREAKER_COOLDOWN_MS = 30_000;
const LOG_EVERY_MS = 60_000;

interface RedisState {
  client: Redis | null;
  url: string;
  failures: number;
  openUntil: number;
  lastLog: number;
  suppressed: number;
}

const store = globalThis as typeof globalThis & {__datausaRedisV1?: RedisState};

function state(): RedisState | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  let s = store.__datausaRedisV1;
  if (!s || s.url !== url) {
    s = store.__datausaRedisV1 = {client: null, url, failures: 0, openUntil: 0, lastLog: 0, suppressed: 0};
  }
  if (!s.client) {
    const client = new Redis(url, {
      // fail fast instead of queueing commands while disconnected; ioredis reconnects in the background
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
      connectTimeout: 2000,
      lazyConnect: false,
      retryStrategy: times => Math.min(times * 200, 5000),
      connectionName: `datausa-site:${process.pid}`
    });
    client.on("error", error => logError(s!, error));
    s.client = client;
  }
  return s;
}

function logError(s: RedisState, error: unknown) {
  const now = Date.now();
  if (now - s.lastLog < LOG_EVERY_MS) {
    s.suppressed++;
    return;
  }
  console.warn(`[redis] ${(error as Error)?.message ?? error}${s.suppressed ? ` (${s.suppressed} more errors in the last ${Math.round((now - s.lastLog) / 1000)} s)` : ""}; the cache is skipped while Redis fails`);
  s.lastLog = now;
  s.suppressed = 0;
}

/** True when Redis is configured. */
export function redisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL);
}

/** The client, or null when Redis is not configured or the breaker is open. */
export function redis(): Redis | null {
  const s = state();
  if (!s?.client) return null;
  if (s.openUntil > Date.now()) return null;
  if (s.client.status !== "ready") return null;
  return s.client;
}

/** The client regardless of the breaker (scripts, purge): null only when not configured. */
export function redisClient(): Redis | null {
  return state()?.client ?? null;
}

export class RedisTimeoutError extends Error {}

/**
 * Runs a Redis operation with a deadline and the circuit breaker. Resolves `undefined` when Redis
 * is unavailable, failing or too slow, so callers carry on without the cache.
 */
export async function withRedis<T>(kind: "read" | "write", op: (client: Redis) => Promise<T>, size = 1): Promise<T | undefined> {
  const s = state();
  const client = redis();
  if (!s || !client) return undefined;
  // a read of many keys (a report's ~170 outputs, some 300 KB) gets the deadline per 50 keys
  const timeoutMs = (kind === "read" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS) * Math.max(1, Math.ceil(size / 50));
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      op(client),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new RedisTimeoutError(`${kind} took longer than ${timeoutMs} ms`)), timeoutMs); })
    ]);
    s.failures = 0;
    return result;
  }
  catch (error) {
    s.failures++;
    if (s.failures >= BREAKER_FAILURES) {
      s.openUntil = Date.now() + BREAKER_COOLDOWN_MS;
      s.failures = 0;
    }
    logError(s, error);
    return undefined;
  }
  finally {
    clearTimeout(timer);
  }
}
