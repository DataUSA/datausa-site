/**
 * Geography levels whose reports are not yet published to search engines.
 *
 * A pending level is searchable and its reports render, but its pages are `noindex` and left out of
 * the sitemap, the search page lists it by name (no population ranking or sizing), and nothing asks
 * Tesseract for its population. School districts are pending until the production Tesseract server
 * carries their data: their report (`src/content/reports/geo/school-district.ts`, chosen in
 * `src/content/registry.ts` whether or not the level is pending) fills in from the district cubes
 * where the server has them and shows the boundary-file facts where it does not.
 *
 * When production has the data, take the level out of this set. `docs/architecture.md` ("School
 * districts") lists what else to review.
 */
export const SCHOOL_DISTRICT = "School District";

export const PENDING_LEVELS: ReadonlySet<string> = new Set([SCHOOL_DISTRICT]);

export function isPendingLevel(hierarchy: string | undefined | null): boolean {
  return Boolean(hierarchy) && PENDING_LEVELS.has(hierarchy as string);
}
