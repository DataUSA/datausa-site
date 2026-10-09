/**
 * Typed registry of report templates by profile slug. Templates are statically imported so the
 * server bundle contains exactly the report families the site supports; chart code stays in lazily
 * loaded client modules (see each profile's `visualizations/index.ts`).
 */
import type {ReportTemplate} from "@/lib/reports/types";
import {template as geo} from "@/content/reports/geo";

export const templates: Record<string, ReportTemplate> = {
  geo
};

export function getTemplate(slug: string): ReportTemplate | undefined {
  return templates[slug];
}

export const profileSlugs = Object.keys(templates);
