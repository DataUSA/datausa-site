/**
 * Home page report columns (legacy `GET /api/home`): one column per report family with its member
 * count and four tiles. Tiles come from Google Analytics (most visited reports) when configured,
 * topped up with the curated defaults below. Cached for an hour.
 */
import {cacheLife, cacheTag} from "next/cache";
import {getMembersBySlugOrId, memberTotals} from "@/lib/dimensions/db";
import {memberImageUrl} from "@/lib/reports/load";
import {popularReportSlugs} from "./analytics";

export interface HomeTile {title: string; url: string; image: string; isNew: boolean}
export interface HomeColumn {title: string; slug: string; dimension: string; icon: string; url: string; total: number; tiles: HomeTile[]}

const TILES_PER_COLUMN = 4;
/** Profile slugs to tag as "New". */
const NEW_PROFILES: string[] = [];
/** Profiles that should never appear as tiles (they dominate the analytics). */
const HIDDEN_PROFILES = ["california", "united-states", "new-york-ny"];

const COLUMNS: {title: string; slug: string; dimension: string; icon: string; days: number; defaults: string[]}[] = [
  {title: "Locations", slug: "geo", dimension: "Geography", icon: "/icons/dimensions/Geography.svg", days: 1,
    defaults: ["california", "welch-wv", "new-york-ny", "houston-tx", "arlington-va"]},
  {title: "Industries", slug: "naics", dimension: "PUMS Industry", icon: "/icons/dimensions/PUMS Industry.svg", days: 7,
    defaults: ["oil-gas-extraction", "finance-insurance", "restaurants-food-services", "utilities", "manufacturing"]},
  {title: "Jobs", slug: "soc", dimension: "PUMS Occupation", icon: "/icons/dimensions/PUMS Occupation.svg", days: 7,
    defaults: ["customer-service-representatives", "police-officers", "service-occupations", "registered-nurses", "physical-therapists"]},
  {title: "Universities", slug: "university", dimension: "University", icon: "/icons/dimensions/University.svg", days: 7,
    defaults: ["harvard-university", "university-of-washington-seattle-campus", "university-of-california-los-angeles", "university-of-california-berkeley", "stanford-university"]},
  {title: "Degrees", slug: "cip", dimension: "CIP", icon: "/icons/dimensions/CIP.svg", days: 7,
    defaults: ["computer-science-110701", "engineering", "general-business-administration-management", "electrical-engineering", "biology"]},
  {title: "Products", slug: "napcs", dimension: "NAPCS", icon: "/icons/dimensions/NAPCS.svg", days: 7,
    defaults: [
      "accounting-and-related-services-except-it-support-services-for-trade-professional-and-business",
      "materials-and-supplies-for-machinery-and-transportation-equipment-manufacturing",
      "research-and-development-services-54301",
      "communications-and-information-and-related-services",
      "contract-management-and-operation-services-except-property-and-construction-project-management"
    ]}
];

export async function getHomeColumns(): Promise<HomeColumn[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("dimensions", "analytics");
  const totals = memberTotals();
  return Promise.all(COLUMNS.map(async column => {
    const popular = (await popularReportSlugs(column.slug, column.days, TILES_PER_COLUMN * 4)).filter(slug => !HIDDEN_PROFILES.includes(slug));
    const keys = Array.from(new Set([...popular, ...column.defaults]));
    const tiles = getMembersBySlugOrId(column.dimension, keys).slice(0, TILES_PER_COLUMN).map(member => ({
      title: member.name,
      url: `/profile/${column.slug}/${member.slug || member.id}`,
      image: memberImageUrl(column.slug, member.slug || member.id, "thumb"),
      isNew: NEW_PROFILES.includes(member.slug) || NEW_PROFILES.includes(member.id)
    }));
    return {
      title: column.title, slug: column.slug, dimension: column.dimension, icon: column.icon,
      url: `/search?dimension=${encodeURIComponent(column.dimension)}`,
      total: totals[column.dimension] ?? 0,
      tiles
    };
  }));
}
