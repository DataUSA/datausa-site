/**
 * Geography levels that have members, shapes and report pages but no data in Tesseract yet.
 *
 * A pending level is searchable and its reports render, as a short placeholder page instead of the
 * full location report (whose 170 data requests would all fail): see
 * `getTemplate` in `src/content/registry.ts`. Its pages are kept out of search engines and the sitemap,
 * and nothing asks Tesseract for its population.
 *
 * When the data arrives, take the level out of this set: its members then get the full location
 * report. `docs/architecture.md` ("Pending geography levels") lists what else to review.
 */
export const SCHOOL_DISTRICT = "School District";

export const PENDING_LEVELS: ReadonlySet<string> = new Set([SCHOOL_DISTRICT]);

export function isPendingLevel(hierarchy: string | undefined | null): boolean {
  return Boolean(hierarchy) && PENDING_LEVELS.has(hierarchy as string);
}
