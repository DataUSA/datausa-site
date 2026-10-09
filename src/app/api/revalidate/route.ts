/**
 * Cache invalidation after dataset releases: `POST /api/revalidate` with the shared secret purges
 * cached API data by tag so the next request fetches fresh numbers. No redeploy, no warm-up.
 *
 *   curl -X POST https://datausa.io/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *        -H "content-type: application/json" -d '{"tags": ["tesseract"]}'
 *
 * Tags: `tesseract` (all Tesseract query results), `geoservice` (geographic relations),
 * `dimensions` (per-member attribute lookups), `external-data` (third-party feeds). Omit `tags`
 * to purge everything. With PM2 cluster workers each holding their own cache, Nginx should route
 * this request to every worker (or run `pm2 reload`) after a release; see docs/deployment.md.
 */
import {revalidateTag} from "next/cache";
import {NextResponse} from "next/server";

const ALL_TAGS = ["tesseract", "geoservice", "dimensions", "external-data"] as const;

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret") ?? new URL(request.url).searchParams.get("secret");
  if (!secret || provided !== secret) return NextResponse.json({ok: false, error: "unauthorized"}, {status: 401});
  const body = await request.json().catch(() => ({})) as {tags?: string[]};
  const tags = (body.tags?.length ? body.tags : [...ALL_TAGS]).filter((t): t is typeof ALL_TAGS[number] => (ALL_TAGS as readonly string[]).includes(t));
  if (!tags.length) return NextResponse.json({ok: false, error: "no valid tags"}, {status: 400});
  tags.forEach(tag => revalidateTag(tag, "max"));
  return NextResponse.json({ok: true, revalidated: tags, at: new Date().toISOString()});
}
