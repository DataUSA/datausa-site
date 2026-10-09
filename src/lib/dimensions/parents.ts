/**
 * Breadcrumb ("parents") resolution for report members. Ported from the legacy
 * `GET /api/parents/:slug/:id` route: geographies use the geoservice intersects API filtered by
 * population, other dimensions use their hierarchy's parent map.
 */
import {intersects} from "@/lib/api/geoservice";
import {getMembers, type MemberRow} from "@/lib/dimensions/db";
import {parentLookup} from "@/lib/content/lookups";
import {BIG_POPULATION, getPopulations} from "@/lib/dimensions/population";

const GEO_ORDER = ["Nation", "State", "County", "MSA", "Place", "PUMA"];

export interface Breadcrumb {
  id: string;
  slug: string;
  name: string;
  hierarchy: string;
  dimension: string;
  overlap_size?: number;
}

/** Parent geographies of `member`, most general first (Nation, State, ...). `loose` widens districts. */
export async function geoParents(member: MemberRow, loose = false): Promise<Breadcrumb[]> {
  if (member.id === "01000US") return [];
  const prefix = member.id.slice(0, 3);
  const targetLevels = prefix === "040" ? "nation"
    : prefix === "050" ? "state,msa"
      : prefix === "310" ? "state"
        : prefix === "160" ? "state,county,msa,puma"
          : prefix === "795" ? "state"
            : prefix === "500" ? loose ? "place,msa,county,state" : "state"
              : undefined;
  const relations = await intersects(member.id, targetLevels, true);
  let ids = relations.map(d => d.geoid);
  const pops = await getPopulations([member.id, ...ids]);
  if ((pops[member.id] ?? 0) > BIG_POPULATION) ids = ids.filter(d => (pops[d] ?? 0) > BIG_POPULATION);
  if (!ids.includes("01000US")) ids.unshift("01000US");
  const overlap = new Map(relations.map(d => [d.geoid, d.overlap_size ?? 0]));
  return getMembers("Geography", ids)
    .map(m => ({id: m.id, slug: m.slug, name: m.name, hierarchy: m.hierarchy, dimension: m.dimension, overlap_size: overlap.get(m.id)}))
    .sort((a, b) => {
      const levelDiff = GEO_ORDER.indexOf(a.hierarchy) - GEO_ORDER.indexOf(b.hierarchy);
      return levelDiff !== 0 ? levelDiff : (b.overlap_size ?? 0) - (a.overlap_size ?? 0);
    });
}

/**
 * Parents of a non-geography member (industries, occupations, degrees, universities, products):
 * the ancestor ids Tesseract reports for the member, in hierarchy order (legacy `/api/parents`).
 */
export async function memberParents(profileSlug: string, member: MemberRow, levels: string[]): Promise<Breadcrumb[]> {
  const lookup = await parentLookup(profileSlug);
  const ids = lookup[member.id] ?? [];
  if (!ids.length) return [];
  return getMembers(member.dimension, ids)
    .map(m => ({id: m.id, slug: m.slug, name: m.name, hierarchy: m.hierarchy, dimension: m.dimension}))
    .sort((a, b) => levels.indexOf(a.hierarchy) - levels.indexOf(b.hierarchy));
}
