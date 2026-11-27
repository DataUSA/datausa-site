/**
 * Cache invalidation after a data release: `POST /api/revalidate` with the shared secret.
 *
 *   curl -X POST https://datausa.io/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *        -H "content-type: application/json" -d '{"cubes": ["acs_yg_total_population_5"]}'
 *
 * - `cubes`: purges the shared cache (Redis) by cube: every generator output, member attributes
 *   entry and lookup table that read one of the cubes is deleted, on every worker and host at once,
 *   and the affected reports are queued for the warmer. Names the cache never saw are reported back
 *   under `unknown` (a typo in a release list shows). See `src/lib/cache/purge.ts`; releases run the
 *   same purge with `npm run cache:purge -- --cubes a,b,c`, which works with the site down.
 * - `tags`: `geoservice`, `dimensions` and `external-data` purge the shared cache's entries with
 *   that tag; together with `tesseract` they also expire the remaining Next `use cache` entries with
 *   that tag (home page, latest-data figures, and attributes and lookups when Redis is not set).
 *   `revalidateTag` reaches only the worker that answers this request: with several PM2 workers,
 *   follow it with `pm2 reload datausa-site` for those.
 *
 * With neither, every Next `use cache` tag is expired on this worker (the previous behaviour); the
 * shared cache is only ever purged by name.
 */
import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";
import {purgeTags} from "@/lib/cache/purge";
import {redisClient} from "@/lib/cache/redis";
import {parsePurgeInput} from "@/lib/cache/tags";

const NEXT_TAGS = ["tesseract", "geoservice", "dimensions", "external-data"] as const;

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret");
  if (!secret || provided !== secret) return NextResponse.json({ok: false, error: "unauthorized"}, {status: 401});
  const body = await request.json().catch(() => ({})) as {tags?: unknown; cubes?: unknown};
  const cubes = Array.isArray(body.cubes) ? body.cubes.map(String) : [];
  const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];

  // Next's own cache (whatever `use cache` remains): the named tags, or all of them when none is named
  const nextTags = (cubes.length || tags.length ? tags : [...NEXT_TAGS]).filter((t): t is typeof NEXT_TAGS[number] => (NEXT_TAGS as readonly string[]).includes(t));
  nextTags.forEach(tag => revalidateTag(tag, "max"));

  const redisTags = tags.filter(t => t !== "tesseract");
  const {valid, invalid} = parsePurgeInput(cubes, redisTags);
  if (!valid.length && !nextTags.length) {
    return NextResponse.json({ok: false, error: "nothing to purge", invalid}, {status: 400});
  }

  let purged: Awaited<ReturnType<typeof purgeTags>> = [];
  if (valid.length) {
    const client = redisClient();
    if (!client) return NextResponse.json({ok: false, error: "REDIS_URL is not set: the shared cache cannot be purged", revalidated: nextTags}, {status: 503});
    try {
      purged = await purgeTags(client, valid);
    }
    catch (error) {
      return NextResponse.json({ok: false, error: `purge failed: ${(error as Error).message}`, revalidated: nextTags}, {status: 502});
    }
  }

  return NextResponse.json({
    ok: true,
    purged: purged.filter(r => r.known).map(r => ({tag: r.tag, deleted: r.deleted, listed: r.listed, queued: r.queued})),
    removed: purged.reduce((n, r) => n + r.deleted, 0),
    unknown: purged.filter(r => !r.known).map(r => r.tag.replace(/^(cube|tag):/, "")),
    invalid,
    revalidated: nextTags,
    at: new Date().toISOString()
  });
}
