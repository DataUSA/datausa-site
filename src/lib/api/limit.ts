/**
 * Process-wide cap on the requests in flight to each data API host (Tesseract, the geoservice).
 *
 * The report engine already runs at most `API_MAX_CONCURRENCY` requests at a time for one report,
 * but nothing bounded the total across the reports a worker renders at once: twenty reports built
 * together on a cold cache meant 240 requests in flight per worker. Every upstream request on the
 * server now waits here for one of `UPSTREAM_MAX_CONCURRENCY` slots of its host, so the most a
 * deployment sends to a host is that number times the PM2 workers. Cached responses never get here.
 * (The legacy CMS had a similar brake: 20 requests a second per process.)
 *
 * A request that waits longer than `UPSTREAM_QUEUE_TIMEOUT_MS` for a slot fails without being sent,
 * like a timeout (its generator yields nothing), so an overloaded server sheds work instead of
 * queueing it without end. While requests are waiting, each host's queue is summarised in the
 * server log at most every 10 seconds, with how long the host took to answer (from sending a
 * request to having read its response, so a worker too busy to read promptly shows here too);
 * `GET /api/debug/upstream` shows the live counters and the last summary.
 *
 * The state lives on `globalThis` so that every module graph of the process (pages, route handlers)
 * shares the same slots.
 */

const MAX_IN_FLIGHT = Math.max(1, Number(process.env.UPSTREAM_MAX_CONCURRENCY) || 8);
/** 0 waits without limit. */
const MAX_WAIT_MS = Number(process.env.UPSTREAM_QUEUE_TIMEOUT_MS ?? 30000);
const LOG_EVERY_MS = 10_000;

interface Waiter {
  queuedAt: number;
  grant: () => void;
  timer?: ReturnType<typeof setTimeout>;
}

interface Counters {
  started: number;
  queued: number;
  maxWaitMs: number;
  maxQueue: number;
  shed: number;
}

/** A host's answer times over one log window. */
interface Latency {
  seconds: number;
  answered: number;
  p50Ms: number | null;
  p95Ms: number | null;
  maxMs: number | null;
}

interface HostQueue {
  inFlight: number;
  waiting: Waiter[];
  /** Counters since the last log line. */
  window: Counters & {since: number};
  /** Answer times in this window (a sample of the first 5,000). */
  answerMs: number[];
  totals: Counters;
  last?: Latency;
}

export class UpstreamBusyError extends Error {}

// versioned: a hot reload in development must not pick up queues of an older shape
const store = globalThis as typeof globalThis & {__upstreamQueuesV2?: Map<string, HostQueue>};
const queues = store.__upstreamQueuesV2 ??= new Map();

const counters = (): Counters => ({started: 0, queued: 0, maxWaitMs: 0, maxQueue: 0, shed: 0});
const emptyWindow = () => ({since: Date.now(), ...counters()});

function queueOf(host: string): HostQueue {
  let queue = queues.get(host);
  if (!queue) {
    queue = {inFlight: 0, waiting: [], window: emptyWindow(), answerMs: [], totals: counters()};
    queues.set(host, queue);
  }
  return queue;
}

function count(queue: HostQueue, update: (w: Counters) => void) {
  update(queue.window);
  update(queue.totals);
}

/** Writes the host's queue summary when requests waited since the last one and 10 s have passed. */
function report(host: string, queue: HostQueue) {
  const w = queue.window;
  if (Date.now() - w.since < LOG_EVERY_MS) return;
  const seconds = (Date.now() - w.since) / 1000;
  const sorted = queue.answerMs.sort((a, b) => a - b);
  const at = (q: number) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : null;
  queue.last = {seconds: Math.round(seconds), answered: sorted.length, p50Ms: at(0.5), p95Ms: at(0.95), maxMs: at(1)};
  if (w.queued || w.shed) {
    const s = (ms: number | null) => ms === null ? "-" : (ms / 1000).toFixed(2);
    console.warn(`[upstream] ${host}: ${w.started} requests in ${seconds.toFixed(0)} s, answered in ${s(queue.last.p50Ms)} s (p95 ${s(queue.last.p95Ms)} s, max ${s(queue.last.maxMs)} s); ${w.queued} waited for one of ${MAX_IN_FLIGHT} slots (longest ${(w.maxWaitMs / 1000).toFixed(1)} s, up to ${w.maxQueue} waiting), ${w.shed} dropped after ${MAX_WAIT_MS / 1000} s; now ${queue.inFlight} in flight, ${queue.waiting.length} waiting`);
  }
  queue.window = emptyWindow();
  queue.answerMs = [];
}

/**
 * Waits for a slot of the URL's host and resolves with the function that frees it, to be called
 * once the response has been read. Rejects with `UpstreamBusyError` when no slot frees up in time.
 * Unparseable URLs and code running in the browser are not limited.
 */
export async function acquireUpstreamSlot(url: string): Promise<() => void> {
  if (typeof window !== "undefined") return () => {};
  let host: string;
  try {
    host = new URL(url).host;
  }
  catch {
    return () => {};
  }
  const queue = queueOf(host);
  let released = false;
  let sentAt = 0;
  const release = () => {
    if (released) return;
    released = true;
    const answerMs = Date.now() - sentAt;
    // the slot first: nothing after this may keep it
    const next = queue.waiting.shift();
    if (next) next.grant();
    else queue.inFlight--;
    if (queue.answerMs.length < 5000) queue.answerMs.push(answerMs);
    report(host, queue);
  };
  const start = () => {
    sentAt = Date.now();
    count(queue, w => { w.started++; });
  };

  if (queue.inFlight < MAX_IN_FLIGHT && !queue.waiting.length) {
    queue.inFlight++;
    start();
    report(host, queue);
    return release;
  }

  return new Promise((resolve, reject) => {
    const waiter: Waiter = {
      queuedAt: Date.now(),
      // the slot passes straight from the releasing request to this one: inFlight is unchanged
      grant: () => {
        clearTimeout(waiter.timer);
        const waited = Date.now() - waiter.queuedAt;
        count(queue, w => { w.maxWaitMs = Math.max(w.maxWaitMs, waited); });
        start();
        resolve(release);
      }
    };
    if (MAX_WAIT_MS > 0) {
      waiter.timer = setTimeout(() => {
        const i = queue.waiting.indexOf(waiter);
        if (i >= 0) queue.waiting.splice(i, 1);
        count(queue, w => { w.shed++; });
        report(host, queue);
        reject(new UpstreamBusyError(`${host} busy: no request slot free after ${MAX_WAIT_MS} ms`));
      }, MAX_WAIT_MS);
    }
    queue.waiting.push(waiter);
    count(queue, w => {
      w.queued++;
      w.maxQueue = Math.max(w.maxQueue, queue.waiting.length);
    });
  });
}

/** This process's counters per host, for `GET /api/debug/upstream`. */
export function upstreamStats() {
  return {
    pid: process.pid,
    maxInFlight: MAX_IN_FLIGHT,
    queueTimeoutMs: MAX_WAIT_MS,
    hosts: Object.fromEntries(Array.from(queues, ([host, q]) => [host, {inFlight: q.inFlight, waiting: q.waiting.length, sinceStart: q.totals, lastWindow: q.last ?? null}]))
  };
}
