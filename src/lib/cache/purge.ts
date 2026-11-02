/**
 * Purge by tag, shared by `POST /api/revalidate` and `scripts/cache/purge.ts` (which talks to Redis
 * directly, so a release can purge with the site down). For each tag:
 *
 * 1. increments its purge counter (`cube-epoch`), so a render that read the data before the purge
 *    can no longer write it back (`storeEntries`);
 * 2. walks its set with `SSCAN` in batches, deleting the entries and removing them from the set
 *    (`SREM`, not `DEL` of the set: an entry written right after the purge with fresh data stays
 *    listed, so the next purge still finds it), and queues their reports for the warmer;
 * 3. reports how many entries existed and were deleted.
 *
 * Names never written by this cache are reported as unknown (only their counter moves).
 */
import type Redis from "ioredis";
import {EPOCH_KEY, TAG_REGISTRY_KEY} from "@/lib/cache/store";

/** Reports to recompute after a purge: set of `<profile>|<member id>`. */
export const WARM_QUEUE_KEY = "warm:pending";

export interface PurgeResult {
  tag: string;
  known: boolean;
  epoch?: number;
  /** Entries listed in the tag set. */
  listed: number;
  /** Entries that still existed and were deleted. */
  deleted: number;
  /** Reports queued for the warmer. */
  queued: number;
}

const BATCH = 500;

export async function purgeTag(client: Redis, tag: string): Promise<PurgeResult> {
  // the counter moves even for a name never written, in case its first entry is being written now
  const epoch = await client.hincrby(EPOCH_KEY, tag, 1);
  const known = (await client.sismember(TAG_REGISTRY_KEY, tag)) === 1;
  if (!known) return {tag, known, epoch, listed: 0, deleted: 0, queued: 0};
  let cursor = "0";
  let listed = 0;
  let deleted = 0;
  const owners = new Set<string>();
  do {
    const [next, members] = await client.sscan(tag, cursor, "COUNT", BATCH);
    cursor = next;
    if (!members.length) continue;
    listed += members.length;
    const keys = members.map(m => m.split("|")[0]);
    members.forEach(m => {
      const [, profile, member] = m.split("|");
      if (profile && member) owners.add(`${profile}|${member}`);
    });
    const pipeline = client.pipeline();
    pipeline.unlink(...keys);
    pipeline.srem(tag, ...members);
    const replies = await pipeline.exec();
    deleted += Number(replies?.[0]?.[1] ?? 0);
  } while (cursor !== "0");
  if (owners.size) {
    const list = Array.from(owners);
    for (let i = 0; i < list.length; i += BATCH) await client.sadd(WARM_QUEUE_KEY, ...list.slice(i, i + BATCH));
  }
  return {tag, known, epoch, listed, deleted, queued: owners.size};
}

export async function purgeTags(client: Redis, tags: string[]): Promise<PurgeResult[]> {
  const results: PurgeResult[] = [];
  for (const tag of tags) results.push(await purgeTag(client, tag));
  return results;
}
