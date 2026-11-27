import type {MetadataRoute} from "next";
import {listMemberSlugs, memberTotalsByHierarchy} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {STATIC_PAGES} from "@/lib/seo/metadata";
import {REPORT_FAMILIES, searchPath, SITE_URL} from "@/lib/seo/site";
import {LANDING_FAMILIES, landingPath} from "@/content/landing/levels";
import {stateCounts} from "@/lib/dimensions/geo-db";
import {stateBySlug} from "@/lib/landing/scope";
import {SITEMAP_CHUNK, sitemapParts, sitemapProfile} from "@/lib/seo/sitemaps";

/** American Samoa, Guam, the Northern Mariana Islands and the U.S. Virgin Islands, which the ACS does not cover. */
const NO_FIGURES = new Set(["60", "66", "69", "78"]);

/** XML needs `&` escaped; Next writes sitemap URLs as given. */
const xml = (url: string) => url.replace(/&/g, "&amp;");

/**
 * The site-level pages: home, the fixed pages, the landing pages of each report family, level and
 * state, and the classification tables.
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
    // the search page of a family; a level's search listing points at its landing page (below)
    pages.push({url: xml(`${SITE_URL}${searchPath(family.dimension)}`), changeFrequency: "monthly", priority: 0.5});
    for (const level of levels) {
      pages.push({url: `${SITE_URL}/about/classifications/${encodeURIComponent(family.dimension)}/${encodeURIComponent(level)}`, changeFrequency: "monthly", priority: 0.3});
    }
  }
  // the landing pages: a hub per family, a page per level and, for levels inside states, one per
  // state that has at least two members of the level (a single member is its own report)
  pages.push({url: `${SITE_URL}/reports`, changeFrequency: "monthly", priority: 0.9});
  const states = [...stateBySlug().values()];
  for (const family of LANDING_FAMILIES) {
    pages.push({url: `${SITE_URL}${landingPath(family)}`, changeFrequency: "monthly", priority: 0.8});
    for (const level of family.levels) {
      if (isPendingLevel(level.hierarchy) || !totals[family.dimension]?.[level.hierarchy]) continue;
      // the level a family opens on is the hub's address, listed above
      if (level.slug !== family.home) pages.push({url: `${SITE_URL}${landingPath(family, level)}`, changeFrequency: "monthly", priority: 0.8});
      if (!level.byState) continue;
      // universities carry no state in their id: every state is listed, and one without any is `noindex`
      const counts = family.dimension === "Geography" ? stateCounts(level.hierarchy) : undefined;
      for (const state of states) {
        // the island territories have members but no survey figures: their pages are `noindex`
        if (NO_FIGURES.has(state.fips) || (counts && (counts.get(state.fips) ?? 0) < 2)) continue;
        pages.push({url: `${SITE_URL}${landingPath(family, level, state.slug)}`, changeFrequency: "monthly", priority: 0.6});
      }
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
