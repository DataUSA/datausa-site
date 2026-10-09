/**
 * Pure URL helpers shared by server and client code (no Next.js runtime imports).
 */

/**
 * Legacy content builds URLs like `${tesseract}tesseract/data?...`, which Tesseract answers with a
 * 307 to `data.jsonrecords`. Rewrite them directly, and make sure the `locale` parameter the API
 * expects is present.
 */
export function normalizeTesseractUrl(url: string): string {
  let out = url.replace(/\/tesseract\/data\?/, "/tesseract/data.jsonrecords?");
  if (/\/tesseract\/data\.jsonrecords\?/.test(out) && !/[?&]locale=/.test(out)) out += "&locale=en";
  return out;
}
