/**
 * Loads a report for a resolved member: computes attributes (cached), runs the engine and prepares
 * sections. Used by the report page, embeds, comparisons, share images and the diagnostics route.
 */
import {cache} from "react";
import {cacheLife, cacheTag} from "next/cache";
import {connection} from "next/server";
import {getTemplate} from "@/content/registry";
import {GEOSERVICE_URL, TESSERACT_URL} from "@/lib/api/tesseract";
import {stateOf} from "@/lib/api/geoservice";
import {getMember, type MemberRow} from "@/lib/dimensions/db";
import {isPendingLevel} from "@/lib/geo/levels";
import {baseAttributes, buildVariables, prepareReport, variablesForClient, type BuiltVariables, type PreparedReport, type SelectorQuery} from "@/lib/reports/engine";
import {resolveReportUrl, type ResolvedReport} from "@/lib/reports/resolve";
import type {MemberAttributes, ReportTemplate, Variables} from "@/lib/reports/types";

export interface LoadedReport {
  template: ReportTemplate;
  member: MemberRow;
  attrs: Variables;
  built: BuiltVariables;
  report: PreparedReport;
  /** The subset of variables the page's charts need in the browser. */
  clientVariables: Variables;
}

/** Member attributes change only with dimension or geoservice data: cache them per member. */
async function cachedAttributes(profileSlug: string, member: MemberAttributes): Promise<Variables> {
  "use cache";
  cacheTag("dimensions", `member:${profileSlug}:${member.id}`);
  cacheLife("dimensions");
  const template = getTemplate(profileSlug, member.hierarchy);
  if (!template) return {};
  return template.attributes(member, {tesseract: TESSERACT_URL, geoservice: GEOSERVICE_URL, locale: "en"});
}

export interface LoadOptions {
  query?: SelectorQuery;
  print?: boolean;
}

/**
 * Runs the engine for an already-resolved member. Memoised per request (React `cache`) so the page
 * and `generateMetadata` share one run; the cache key is the member plus the serialised options.
 */
export const loadMemberReport = cache(async (profileSlug: string, member: MemberRow, options: LoadOptions = {}): Promise<LoadedReport> =>
  runMemberReport(profileSlug, member, JSON.stringify(options)));

const runMemberReport = cache(async (profileSlug: string, member: MemberRow, serializedOptions: string): Promise<LoadedReport> => {
  // Report variables are computed per request (the data cache sits below, in the API layer, and a
  // few generators read the clock), so tell Next explicitly instead of letting the prerender pass
  // trip over `new Date()`.
  await connection();
  const {query = {}, print = false} = JSON.parse(serializedOptions) as LoadOptions;
  const template = getTemplate(profileSlug, member.hierarchy);
  if (!template) throw new Error(`Unknown profile ${profileSlug}`);
  const memberAttrs: MemberAttributes = {
    id: member.id, dimension: member.dimension, hierarchy: member.hierarchy, slug: member.slug,
    name: member.name, cubeName: member.cubeName, imageId: member.imageId, zvalue: member.zvalue
  };
  const custom = await cachedAttributes(profileSlug, memberAttrs);
  const attrs: Variables = {...baseAttributes(memberAttrs, print), ...custom};
  const built = await buildVariables(template, attrs);
  const report = prepareReport(template, built.variables, query);
  const clientVariables = variablesForClient(report, built.variables, template.selectors);
  return {template, member, attrs, built, report, clientVariables};
});

export type LoadResult = Exclude<ResolvedReport, {status: "ok"}> | ({status: "ok"} & LoadedReport);

/** Convenience for callers that start from a URL (diagnostics, embeds). */
export async function loadReport(profileSlug: string, idOrSlug: string, options: LoadOptions = {}): Promise<LoadResult> {
  const resolved = resolveReportUrl(profileSlug, idOrSlug);
  if (resolved.status !== "ok") return resolved;
  const loaded = await loadMemberReport(profileSlug, resolved.member, options);
  return {status: "ok", ...loaded};
}

/** Splits `compare_`-prefixed selector query keys into the comparison's own query (legacy behaviour). */
export function splitComparisonQuery(query: SelectorQuery): {primary: SelectorQuery; comparison: SelectorQuery} {
  const primary: SelectorQuery = {};
  const comparison: SelectorQuery = {};
  Object.entries(query).forEach(([key, value]) => {
    if (key.startsWith("compare_")) comparison[key.slice(8)] = value;
    else primary[key] = value;
  });
  return {primary, comparison};
}

/**
 * The member whose photo illustrates a report: the member itself, or its state for a level the image
 * host has no photos for (it answers an unknown member with a stock picture).
 */
export function imageMember(member: MemberRow): MemberRow {
  if (member.dimension !== "Geography" || !isPendingLevel(member.hierarchy)) return member;
  const state = stateOf(member.id);
  return (state ? getMember("Geography", state) : undefined) ?? member;
}

/**
 * URL of a member's splash or thumbnail image: this site's `/api/profile/...` route, or the same path
 * on `NEXT_PUBLIC_IMAGE_BASE_URL` when the photos are served from another host.
 */
export function memberImageUrl(profileSlug: string, memberSlug: string, size: "splash" | "thumb"): string {
  const base = (process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/api/profile/${profileSlug}/${memberSlug}/${size}`;
}
