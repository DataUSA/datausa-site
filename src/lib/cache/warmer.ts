/**
 * The warmer: recomputes, in the background, the reports whose cached generator outputs were purged,
 * and after a deploy the states and top counties (only the generators whose version changed miss).
 *
 * - One warmer per Redis: every PM2 worker starts this loop (`src/instrumentation.ts`), but only the
 *   one holding `warmer:leader` (`SET NX PX`, renewed while it runs) does any work.
 * - Work comes from `warm:pending` (`<profile>|<member id>`, filled by purges and by deploys) and is
 *   taken in priority order: states, then counties by population, then everything else.
 * - Each report goes through the same engine path as a page view (`loadEngine` with the warmer's
 *   throttle), so only missing outputs are fetched and the entries are the ones a view would write.
 * - Tesseract queries are capped at `WARMER_MAX_QPS` (default 5 per second) and the warmer waits
 *   while user renders are queuing in this worker's upstream limiter.
 *
 * Settings: `WARMER_ENABLED` (default on in production when `REDIS_URL` is set),
 * `WARMER_MAX_QPS`, `WARMER_DEPLOY_COUNTIES` (counties warmed after a deploy, default 100).
 */
import {randomUUID} from "node:crypto";
import {upstreamStats} from "@/lib/api/limit";
import {generatorManifest} from "@/lib/cache/manifest";
import {WARM_QUEUE_KEY} from "@/lib/cache/purge";
import {redisClient} from "@/lib/cache/redis";
import {hash} from "@/lib/cache/generator-cache";
import {getMember, getProfile, listMembers} from "@/lib/dimensions/db";

const LEADER_KEY = "warmer:leader";
const LEADER_MS = 30_000;
const DEPLOY_KEY = "warmer:last-manifest";
const IDLE_MS = 10_000;
const MAX_QPS = Math.max(0.1, Number(process.env.WARMER_MAX_QPS ?? 5));
const DEPLOY_COUNTIES = Number(process.env.WARMER_DEPLOY_COUNTIES ?? 100);

const store = globalThis as typeof globalThis & {__warmerV1?: {started: boolean; id: string; stats: WarmerStats}};

export interface WarmerStats {
  leader: boolean;
  warmed: number;
  failed: number;
  queries: number;
  pending: number;
  lastReport?: string;
  lastError?: string;
}

/** Token bucket shared by the warmer's renders: resolves when one more upstream query may be sent. */
function throttle(stats: WarmerStats): () => Promise<void> {
  let next = Date.now();
  const interval = 1000 / MAX_QPS;
  return async () => {
    // let user renders go first: wait while any of this worker's upstream queues has waiters
    for (;;) {
      const hosts = Object.values(upstreamStats().hosts) as {waiting: number}[];
      if (!hosts.some(h => h.waiting > 0)) break;
      await sleep(500);
    }
    const now = Date.now();
    const at = Math.max(now, next);
    next = at + interval;
    if (at > now) await sleep(at - now);
    stats.queries++;
  };
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/** Lower first: states, then counties by population, then the rest. */
function priority(profile: string, memberId: string): number {
  if (profile !== "geo") return 3;
  const member = getMember("Geography", memberId);
  if (!member) return 4;
  // within a level, larger populations first (zvalue is the population scaled to 0..1)
  const smaller = 1 - Math.min(1, Math.max(0, member.zvalue ?? 0));
  if (member.hierarchy === "Nation") return 0;
  if (member.hierarchy === "State") return 0.1 + smaller * 0.8;
  if (member.hierarchy === "County") return 1 + smaller;
  return 3;
}

/** Queues the states and the most populous counties when the manifest changed since the last deploy warm. */
async function queueAfterDeploy() {
  const client = redisClient();
  const manifest = generatorManifest();
  if (!client || !manifest) return;
  const id = hash(`${JSON.stringify(manifest.generators)}|${manifest.legacy}`);
  const previous = await client.getset(DEPLOY_KEY, id);
  if (previous === id) return;
  const states = listMembers("Geography", "State", 100).map(m => `geo|${m.id}`);
  const counties = listMembers("Geography", "County", DEPLOY_COUNTIES).map(m => `geo|${m.id}`);
  const all = ["geo|01000US", ...states, ...counties];
  await client.sadd(WARM_QUEUE_KEY, ...all);
  console.log(`[warmer] generator versions changed since the last deploy: queued ${all.length} reports`);
}

async function warmOne(entry: string, stats: WarmerStats, wait: () => Promise<void>) {
  const [profileSlug, memberId] = entry.split("|");
  const profile = getProfile(profileSlug);
  const member = profile ? getMember(profile.dimension, memberId) : undefined;
  if (!member) return;
  // imported lazily: the engine pulls in every report template
  const {loadEngine} = await import("@/lib/reports/load");
  const run = await loadEngine(profileSlug, member, false, {throttle: wait, label: "warmer", retryFailures: true});
  const failed = run.built.diagnostics.failed.length;
  stats.warmed++;
  if (failed) stats.failed++;
  stats.lastReport = `${profileSlug}/${member.slug}: ${run.built.diagnostics.cache?.misses ?? 0} recomputed, ${failed} failed`;
}

async function loop(state: NonNullable<typeof store.__warmerV1>) {
  const {stats, id} = state;
  const wait = throttle(stats);
  for (;;) {
    const client = redisClient();
    if (!client || client.status !== "ready") {
      await sleep(IDLE_MS);
      continue;
    }
    try {
      const acquired = await client.set(LEADER_KEY, id, "PX", LEADER_MS, "NX");
      const holder = acquired ? id : await client.get(LEADER_KEY);
      stats.leader = holder === id;
      if (!stats.leader) {
        await sleep(IDLE_MS);
        continue;
      }
      await client.pexpire(LEADER_KEY, LEADER_MS);
      if (acquired) await queueAfterDeploy();
      const pending = await client.smembers(WARM_QUEUE_KEY);
      stats.pending = pending.length;
      if (!pending.length) {
        await sleep(IDLE_MS);
        continue;
      }
      const ordered = pending.map(e => {
        const [p, m] = e.split("|");
        return {e, rank: priority(p, m)};
      }).sort((a, b) => a.rank - b.rank);
      // one report at a time, renewing the leadership between them
      for (const {e} of ordered.slice(0, 20)) {
        if ((await client.get(LEADER_KEY)) !== id) break;
        await client.pexpire(LEADER_KEY, LEADER_MS);
        try {
          await warmOne(e, stats, wait);
        }
        catch (error) {
          stats.failed++;
          stats.lastError = `${e}: ${(error as Error).message}`;
        }
        await client.srem(WARM_QUEUE_KEY, e);
      }
    }
    catch (error) {
      stats.lastError = (error as Error).message;
      await sleep(IDLE_MS);
    }
  }
}

export function warmerEnabled(): boolean {
  if (!process.env.REDIS_URL) return false;
  const flag = process.env.WARMER_ENABLED;
  return flag ? flag === "true" : process.env.NODE_ENV === "production";
}

/** Starts the warmer loop of this worker (once). */
export function startWarmer() {
  if (store.__warmerV1?.started || !warmerEnabled()) return;
  const state = store.__warmerV1 = {started: true, id: `${process.pid}:${randomUUID()}`, stats: {leader: false, warmed: 0, failed: 0, queries: 0, pending: 0}};
  void loop(state);
  console.log(`[warmer] started in worker ${process.pid} (at most ${MAX_QPS} queries/s)`);
}

export function warmerStats(): WarmerStats | null {
  return store.__warmerV1?.stats ?? null;
}
