/**
 * Invalidation tags of cached values. A tag is also the name of the Redis set that lists the entries
 * carrying it, and the field of its purge counter in the `cube-epoch` hash:
 *
 * - `cube:<name>`: data read from one Tesseract cube (any URL with `cube=`, or a path-style
 *   `/cubes/<name>` URL), whatever the endpoint: `data`, `members`, `complexity`, `calcs`.
 * - `tag:geoservice`: geographic relations from the geoservice.
 * - `tag:dimensions`: answers read from the dimensions SQLite database only.
 * - `tag:external-data`: third-party feeds.
 *
 * Pure: no Next.js or Redis imports, so the purge CLI uses it too.
 */

export const TAG_GEOSERVICE = "tag:geoservice";
export const TAG_DIMENSIONS = "tag:dimensions";
export const TAG_EXTERNAL = "tag:external-data";
export const OTHER_TAGS = ["geoservice", "dimensions", "external-data"] as const;

export const cubeTag = (cube: string) => `cube:${cube}`;

/**
 * The tag of an absolute upstream URL, or `null` when the URL cannot be mapped (the value read
 * from it is then left uncached).
 */
export function tagForUrl(url: string, geoserviceUrl: string): string | null {
  if (url.startsWith(geoserviceUrl)) return TAG_GEOSERVICE;
  let parsed: URL;
  try {
    parsed = new URL(url);
  }
  catch {
    return null;
  }
  const cube = parsed.searchParams.get("cube");
  if (cube) return cubeTag(cube.trim());
  const pathCube = parsed.pathname.match(/\/cubes\/([^/]+)/);
  if (pathCube) return cubeTag(decodeURIComponent(pathCube[1]).replace(/\.(json|jsonrecords|csv)$/, ""));
  return null;
}

/** Turns purge input (`cubes` names and `tags` names) into tags. */
export function parsePurgeInput(cubes: string[] = [], tags: string[] = []): {valid: string[]; invalid: string[]} {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const cube of cubes) {
    const name = String(cube).trim();
    if (/^[\w .,()+-]+$/.test(name)) valid.push(cubeTag(name));
    else invalid.push(String(cube));
  }
  for (const tag of tags) {
    if ((OTHER_TAGS as readonly string[]).includes(tag)) valid.push(`tag:${tag}`);
    else invalid.push(String(tag));
  }
  return {valid: Array.from(new Set(valid)), invalid};
}
