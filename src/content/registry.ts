/**
 * Typed registry of report templates by profile slug. Templates are statically imported so the
 * server bundle contains exactly the report families the site supports; chart code stays in lazily
 * loaded client modules (see each profile's `visualizations/index.ts`).
 */
import type {ReportTemplate} from "@/lib/reports/types";
import {template as geo} from "@/content/reports/geo";
import {template as cip} from "@/content/reports/cip";
import {template as naics} from "@/content/reports/naics";
import {template as soc} from "@/content/reports/soc";
import {template as university} from "@/content/reports/university";
import {template as napcs} from "@/content/reports/napcs";
import {schoolDistrictTemplate} from "@/content/reports/geo/school-district";
import {isPendingLevel, SCHOOL_DISTRICT} from "@/lib/geo/levels";

export const templates: Record<string, ReportTemplate> = {
  geo, cip, naics, soc, university, napcs
};

/**
 * Placeholder templates of geography levels that have no data yet (`src/lib/geo/levels.ts`), by
 * level. Every level in `PENDING_LEVELS` needs one.
 */
const pendingTemplates: Record<string, ReportTemplate> = {
  [SCHOOL_DISTRICT]: schoolDistrictTemplate
};

/**
 * The template of a report family. With the member's `hierarchy`, a location of a level that has no
 * data yet gets that level's placeholder template instead of the full location report.
 */
export function getTemplate(slug: string, hierarchy?: string): ReportTemplate | undefined {
  if (slug === "geo" && hierarchy && isPendingLevel(hierarchy) && pendingTemplates[hierarchy]) return pendingTemplates[hierarchy];
  return templates[slug];
}

export const profileSlugs = Object.keys(templates);
