/**
 * The Redis connection of this worker (one per process), for the generator cache, the purge and the
 * warmer. `REDIS_URL` unset means no Redis: `redis()` returns null and every caller falls back to
 * rendering without the shared cache.
 *
 * Redis must never fail a page. Every command goes through `withRedis`, which gives it a deadline
 * (`REDIS_READ_TIMEOUT_MS`, default 50 ms, for reads; `REDIS_WRITE_TIMEOUT_MS`, default 1 s, for
 * writes) and feeds a circuit breaker: after `BREAKER_FAILURES` consecutive errors or timeouts the
 * cache is skipped for `BREAKER_COOLDOWN_MS`, then one command is let through to probe it. A deadline
 * missed because this worker's event loop was busy is extended and never counts as a failure (see
 * `deadline`). Errors are logged at most once a minute, with how many were suppressed.
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

export class RedisTimeoutError extends Error {
  /** True when the worker's own event loop was busy for most of the wait, not Redis. */
  constructor(message: string, readonly busyLoop: boolean) {
    super(message);
  }
}

/** A deadline window counts as the loop's delay, not Redis's, when its timer fired this late. */
const LATE_FRACTION = 0.5;
/** How many more windows a command gets while the loop is busy, before it gives up. */
const BUSY_EXTENSIONS = 3;

/**
 * Rejects after `timeoutMs` of waiting that the worker itself did not cause. A busy event loop (a
 * burst of renders) delays both the deadline's timer and the processing of a reply that may already
 * have arrived, and Node runs due timers before it reads the socket. So:
 * - the rejection waits for `setImmediate`, which runs after the loop has read pending I/O: a reply
 *   that arrived while the loop was blocked settles the command first;
 * - a window whose timer fired more than `LATE_FRACTION` late was mostly the loop's delay, so the
 *   command gets another window (up to `BUSY_EXTENSIONS`). If it still times out after those, the
 *   error is marked `busyLoop` and does not count towards the breaker.
 */
function deadline(timeoutMs: number, label: string): {promise: Promise<never>; cancel: () => void} {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let immediate: ReturnType<typeof setImmediate> | undefined;
  let extensions = 0;
  let busy = false;
  const promise = new Promise<never>((_, reject) => {
    const arm = () => {
      const due = Date.now() + timeoutMs;
      timer = setTimeout(() => {
        const late = Date.now() - due > timeoutMs * LATE_FRACTION;
        if (late) busy = true;
        if (late && extensions < BUSY_EXTENSIONS) {
          extensions++;
          arm();
          return;
        }
        immediate = setImmediate(() => reject(new RedisTimeoutError(`${label} took longer than ${timeoutMs} ms${busy ? " (this worker was busy)" : ""}`, late)));
      }, timeoutMs);
    };
    arm();
  });
  return {promise, cancel: () => { clearTimeout(timer); if (immediate) clearImmediate(immediate); }};
}

/**
 * Runs a Redis operation with a deadline and the circuit breaker. Resolves `undefined` when Redis
 * is unavailable, failing or too slow, so callers carry on without the cache. A timeout caused by
 * the worker's own busy event loop (see `deadline`) is not a Redis failure: it does not move the
 * breaker, which would otherwise send every page to the data API at the moment the worker is busiest.
 */
export async function withRedis<T>(kind: "read" | "write", op: (client: Redis) => Promise<T>, size = 1): Promise<T | undefined> {
  const s = state();
  const client = redis();
  if (!s || !client) return undefined;
  // a read of many keys (a report's ~170 outputs, some 300 KB) gets the deadline per 50 keys
  const timeoutMs = (kind === "read" ? READ_TIMEOUT_MS : WRITE_TIMEOUT_MS) * Math.max(1, Math.ceil(size / 50));
  const limit = deadline(timeoutMs, kind);
  limit.promise.catch(() => {});
  try {
    const result = await Promise.race([op(client), limit.promise]);
    s.failures = 0;
    return result;
  }
  catch (error) {
    if (!(error instanceof RedisTimeoutError && error.busyLoop)) {
      s.failures++;
      if (s.failures >= BREAKER_FAILURES) {
        s.openUntil = Date.now() + BREAKER_COOLDOWN_MS;
        s.failures = 0;
      }
    }
    logError(s, error);
    return undefined;
  }
  finally {
    limit.cancel();
  }
}
