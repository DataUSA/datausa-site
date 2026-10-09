import type {MetadataRoute} from "next";
import {getProfile, listMemberSlugs} from "@/lib/dimensions/db";
import {SITEMAP_CHUNK, sitemapParts} from "@/lib/seo/sitemaps";

const SITE_URL = (process.env.SITE_URL ?? "https://datausa.io").replace(/\/$/, "");

/** `/sitemap/0.xml` lists static pages; `/sitemap/<n>.xml` list report URLs in 5,000-member chunks. */
export async function generateSitemaps() {
  return [{id: 0}, ...sitemapParts().map(p => ({id: p.id}))];
}

export default async function sitemap({id: rawId}: {id: number | string | Promise<number | string>}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await rawId); // Next 16 hands the id over asynchronously
  if (id === 0) {
    return ["/", "/search", "/about/background", "/about/press", "/about/glossary", "/about/usage", "/about/datasets", "/about/api"]
      .map(path => ({url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.5}));
  }
  const part = sitemapParts().find(p => p.id === id);
  if (!part) return [];
  const profile = getProfile(part.profile);
  if (!profile) return [];
  const {rows} = listMemberSlugs(profile, SITEMAP_CHUNK, part.offset);
  return rows.map(m => ({
    url: `${SITE_URL}/profile/${part.profile}/${m.slug}`,
    changeFrequency: "monthly" as const,
    priority: m.zvalue !== null ? Math.max(0.3, Math.min(0.9, 0.3 + m.zvalue)) : 0.4
  }));
}
