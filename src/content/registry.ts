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

export const templates: Record<string, ReportTemplate> = {
  geo, cip, naics, soc, university, napcs
};

export function getTemplate(slug: string): ReportTemplate | undefined {
  return templates[slug];
}

export const profileSlugs = Object.keys(templates);
