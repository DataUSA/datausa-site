/**
 * Purges the shared cache by cube after a data release, straight against Redis (the site may be down).
 *
 *   REDIS_URL=redis://127.0.0.1:6379 npx tsx scripts/cache/purge.ts --cubes acs_yg_total_population_5,pums_5
 *   npx tsx scripts/cache/purge.ts --tags geoservice --redis redis://host:6379
 *   npx tsx scripts/cache/purge.ts --stats            # entries and tag sets, no purge
 *
 * For each cube it bumps the purge counter, deletes every entry tagged with it, and queues the
 * affected reports for the warmer (which recomputes them in the background once the site runs).
 * Exits with status 2 when a name was never seen by the cache, so a typo in a release list shows.
 */
import Redis from "ioredis";
import {purgeTags, WARM_QUEUE_KEY} from "../../src/lib/cache/purge";
import {EPOCH_KEY, TAG_REGISTRY_KEY} from "../../src/lib/cache/store";
import {parsePurgeInput} from "../../src/lib/cache/tags";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const list = (value?: string) => (value ?? "").split(",").map(s => s.trim()).filter(Boolean);

async function main() {
  const url = arg("redis") ?? process.env.REDIS_URL;
  if (!url) throw new Error("set REDIS_URL or pass --redis redis://host:port");
  const client = new Redis(url, {maxRetriesPerRequest: 2, connectTimeout: 5000});
  try {
    if (process.argv.includes("--stats")) {
      const [keys, tags, epochs, pending, info] = await Promise.all([
        client.dbsize(), client.scard(TAG_REGISTRY_KEY), client.hlen(EPOCH_KEY), client.scard(WARM_QUEUE_KEY), client.info("memory")
      ]);
      const used = info.match(/used_memory_human:(\S+)/)?.[1];
      console.log(JSON.stringify({keys, tags, purgedTags: epochs, warmPending: pending, usedMemory: used}, null, 1));
      return;
    }
    const {valid, invalid} = parsePurgeInput(list(arg("cubes")), list(arg("tags")));
    if (invalid.length) console.error(`invalid names: ${invalid.join(", ")}`);
    if (!valid.length) throw new Error("nothing to purge: pass --cubes a,b,c and/or --tags geoservice,dimensions,external-data");
    const results = await purgeTags(client, valid);
    let unknown = 0;
    for (const r of results) {
      if (!r.known) unknown++;
      console.log(r.known
        ? `${r.tag}: deleted ${r.deleted} entries (${r.listed} listed), ${r.queued} reports queued for the warmer`
        : `${r.tag}: unknown (no entry was ever cached for it)`);
    }
    if (unknown || invalid.length) process.exitCode = 2;
  }
  finally {
    client.disconnect();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
