import type {MetadataRoute} from "next";
import {sitemapIndexUrls} from "@/lib/seo/sitemaps";

const SITE_URL = (process.env.SITE_URL ?? "https://datausa.io").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {userAgent: "*", allow: "/", disallow: ["/api/", "/profile/*/*/*/*"]}
    ],
    sitemap: sitemapIndexUrls(SITE_URL)
  };
}
