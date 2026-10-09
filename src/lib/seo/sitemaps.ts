/**
 * Partitioned sitemaps generated from dimension metadata, so every report URL is discoverable
 * without rendering any report. One file per profile family and 5,000-member chunk.
 */
import {profileSlugs} from "@/content/registry";
import {getProfile, listMemberSlugs} from "@/lib/dimensions/db";

export const SITEMAP_CHUNK = 5000;

export interface SitemapPart {
  id: number;
  profile: string;
  offset: number;
}

/** Every sitemap part for the implemented profile families. */
export function sitemapParts(): SitemapPart[] {
  const parts: SitemapPart[] = [];
  let id = 1; // 0 is the site-level sitemap (home, about pages)
  for (const slug of profileSlugs) {
    const profile = getProfile(slug);
    if (!profile) continue;
    const total = listMemberSlugs(profile, 0, 0).total;
    for (let offset = 0; offset < total; offset += SITEMAP_CHUNK) parts.push({id: id++, profile: slug, offset});
  }
  return parts;
}

export function sitemapIndexUrls(siteUrl: string): string[] {
  return [`${siteUrl}/sitemap/0.xml`, ...sitemapParts().map(p => `${siteUrl}/sitemap/${p.id}.xml`)];
}
