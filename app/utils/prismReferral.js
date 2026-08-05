const PRISM_HOST = "peopleprism.ai";

/**
 * @param {string} url
 */
export function isPrismUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === PRISM_HOST;
  }
  catch {
    return false;
  }
}

/**
 * @param {string} url
 * @param {{ pathname?: string, sectionSlug?: string, userId?: number | string | null }} [options]
 */
export function withPrismReferral(url, { pathname = "", sectionSlug = "", userId } = {}) {
  if (!isPrismUrl(url)) return url;

  const target = new URL(url);
  const refLocation = sectionSlug ? `${pathname}#${sectionSlug}` : pathname;

  target.searchParams.set("referrer", "data-usa");
  target.searchParams.set("ref_location", refLocation);
  if (userId) target.searchParams.set("uid", String(userId));

  return target.toString();
}
