/**
 * Pure URL helpers shared by server and client code (no Next.js runtime imports).
 */

/**
 * Legacy content builds URLs like `${tesseract}tesseract/data?...`, which Tesseract answers with a
 * 307 to `data.jsonrecords`. Rewrite them directly, and make sure the `locale` parameter the API
 * expects is present.
 *
 * Also drops `sparse=false`, which a few election queries send. The production server ignores it;
 * the newer one (penn) honours it, returning every combination of the drilldowns' members, filled
 * or not, and then ignoring `time=year.latest`: 295,659 rows (56 MB, 10 to 15 s) for a state's
 * results where the production server returns 6. A response that size is also larger than a
 * worker's whole data cache, so it was fetched again on every report load.
 */
export function normalizeTesseractUrl(url: string): string {
  let out = url
    .replace(/\/tesseract\/data\?/, "/tesseract/data.jsonrecords?")
    .replace(/([?&])sparse=false(&|$)/g, (_, separator: string, next: string) => next ? separator : "");
  if (/\/tesseract\/data\.jsonrecords\?/.test(out) && !/[?&]locale=/.test(out)) out += "&locale=en";
  return out;
}
