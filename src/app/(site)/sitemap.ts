import type {MetadataRoute} from "next";
import {listMemberSlugs, memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {STATIC_PAGES} from "@/lib/seo/metadata";
import {REPORT_FAMILIES, searchPath, SITE_URL} from "@/lib/seo/site";
import {SITEMAP_CHUNK, sitemapParts, sitemapProfile} from "@/lib/seo/sitemaps";

/** XML needs `&` escaped; Next writes sitemap URLs as given. */
const xml = (url: string) => url.replace(/&/g, "&amp;");

/**
 * The site-level pages: home, the fixed pages, and the pages that list one report family or one of
 * its levels (search landing pages and classification tables).
 */
function sitePages(): MetadataRoute.Sitemap {
  const totals = memberTotalsByHierarchy();
  const pages: MetadataRoute.Sitemap = [
    {url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1},
    ...Object.values(STATIC_PAGES).map(page => ({url: `${SITE_URL}${page.path}`, changeFrequency: "monthly" as const, priority: page.path === "/search" ? 0.8 : 0.5}))
  ];
  for (const family of REPORT_FAMILIES) {
    // the pages of a level without data yet are left out until its reports have content
    const levels = Object.keys(totals[family.dimension] ?? {}).filter(level => !isPendingLevel(level));
    if (!levels.length) continue;
    pages.push({url: xml(`${SITE_URL}${searchPath(family.dimension)}`), changeFrequency: "monthly", priority: 0.7});
    for (const level of levels) {
      pages.push({url: xml(`${SITE_URL}${searchPath(family.dimension, level)}`), changeFrequency: "monthly", priority: 0.6});
      pages.push({url: `${SITE_URL}/about/classifications/${encodeURIComponent(family.dimension)}/${encodeURIComponent(level)}`, changeFrequency: "monthly", priority: 0.3});
    }
  }
  return pages;
}

/** `/sitemap/0.xml` lists the site-level pages; `/sitemap/<n>.xml` list report URLs in 5,000-member chunks. */
export async function generateSitemaps() {
  return [{id: 0}, ...sitemapParts().map(p => ({id: p.id}))];
}

export default async function sitemap({id: rawId}: {id: number | string | Promise<number | string>}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await rawId); // Next 16 hands the id over asynchronously
  if (id === 0) return sitePages();
  const part = sitemapParts().find(p => p.id === id);
  if (!part) return [];
  const profile = sitemapProfile(part.profile);
  if (!profile) return [];
  const {rows} = listMemberSlugs(profile, SITEMAP_CHUNK, part.offset);
  return rows.map(m => ({
    url: `${SITE_URL}/profile/${part.profile}/${m.slug}`,
    changeFrequency: "monthly" as const,
    priority: m.zvalue !== null ? Math.max(0.3, Math.min(0.9, 0.3 + m.zvalue)) : 0.4
  }));
}
