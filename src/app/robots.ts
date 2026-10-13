import type {MetadataRoute} from "next";
import {sitemapIndexUrls} from "@/lib/seo/sitemaps";

import {SITE_URL} from "@/lib/seo/site";

/**
 * Crawlers may fetch everything except the JSON API and the single-chart embeds (one per chart of
 * every report: millions of URLs that only repeat their report). Share images live under `/og/`,
 * outside `/api/`, because social crawlers obey these rules too and will not show a blocked image.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {userAgent: "*", allow: ["/", "/og/"], disallow: ["/api/", "/profile/*/*/*/*"]}
    ],
    sitemap: sitemapIndexUrls(SITE_URL)
  };
}
