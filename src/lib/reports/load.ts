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
import {SCHOOL_DISTRICT} from "@/lib/geo/levels";
import {withUpstreamScope} from "@/lib/api/upstream-scope";
import {hash, stableJson} from "@/lib/cache/generator-cache";
import {generatorManifest} from "@/lib/cache/manifest";
import {redisConfigured} from "@/lib/cache/redis";
import {cachedValue} from "@/lib/cache/values";
import {baseAttributes, buildVariables, describeFailures, prepareReport, variablesForClient, type BuildOptions, type BuiltVariables, type PreparedReport, type SelectorQuery} from "@/lib/reports/engine";
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

/**
 * Member attributes change only with dimension or geoservice data: cache them per member. Only
 * complete attributes are cached: the explicit `cacheLife("dimensions")` overrides the second-long
 * life `fetchData` gives a failure (`cacheLife` docs, "Nested caching behavior"), so attributes
 * computed while the geoservice failed (no parents, no neighbours) would be served for days. This
 * throws instead (an entry that throws is not stored) and `memberAttributes` recomputes them
 * without the cache, for this request only.
 */
async function cachedAttributes(profileSlug: string, member: MemberAttributes): Promise<Variables> {
  "use cache";
  cacheTag("dimensions", `member:${profileSlug}:${member.id}`);
  cacheLife("dimensions");
  const {value, scope} = await withUpstreamScope(() => computeAttributes(profileSlug, member));
  if (scope.failures.length) throw new Error(`incomplete attributes for ${profileSlug}/${member.id}, not cached: ${scope.failures[0]}`);
  return value;
}

async function computeAttributes(profileSlug: string, member: MemberAttributes): Promise<Variables> {
  const template = getTemplate(profileSlug, member.hierarchy);
  if (!template) return {};
  return template.attributes(member, {tesseract: TESSERACT_URL, geoservice: GEOSERVICE_URL, locale: "en"});
}

async function memberAttributes(profileSlug: string, member: MemberAttributes): Promise<Variables> {
  // With Redis: one entry per member in the shared store, tagged with what the attributes read
  // (geoservice, the population cube, the lookup tables' cubes), versioned by the attribute code.
  const manifest = redisConfigured() ? generatorManifest() : null;
  const templateKey = member.hierarchy === SCHOOL_DISTRICT && profileSlug === "geo" ? "geo/school-district" : profileSlug;
  const version = manifest?.attributes[templateKey];
  if (version) {
    const key = `attrs:${templateKey}:${version}:${hash(`${TESSERACT_URL}|${GEOSERVICE_URL}`)}:${hash(stableJson(member))}`;
    return cachedValue(key, `${profileSlug}|${member.id}`, () => computeAttributes(profileSlug, member));
  }
  try {
    return await cachedAttributes(profileSlug, member);
  }
  catch {
    return computeAttributes(profileSlug, member);
  }
}

export interface LoadOptions {
  query?: SelectorQuery;
  print?: boolean;
}

/** The engine's part of a report: attributes and variables, before selectors apply. */
export interface EngineRun {
  template: ReportTemplate;
  member: MemberRow;
  attrs: Variables;
  built: BuiltVariables;
}

/**
 * One engine run per member per request. React `cache()` compares arguments by identity, and the
 * page, `generateMetadata` and embeds pass different member objects and options, so the memo is a
 * per-request map keyed by primitives: profile, member and the print flag (the only option the
 * engine reads; selectors apply afterwards, in `prepareReport`). Outside a React render (route
 * handlers, the warmer) every call runs the engine.
 */
const engineRuns = cache(() => new Map<string, Promise<EngineRun>>());

export function loadEngine(profileSlug: string, member: MemberRow, print = false, options: BuildOptions & {label?: string} = {}): Promise<EngineRun> {
  const key = [profileSlug, member.dimension, member.id, member.cubeName, print ? "print" : ""].join("|");
  const runs = engineRuns();
  let run = runs.get(key);
  if (!run) {
    run = runEngine(profileSlug, member, print, options);
    runs.set(key, run);
  }
  return run;
}

/**
 * The template and the attributes the engine runs with for a member (attributes from the shared
 * cache when they are there). The batched warmer plans with these before rendering.
 */
export async function engineInputs(profileSlug: string, member: MemberRow, print = false): Promise<{template: ReportTemplate; attrs: Variables}> {
  const template = getTemplate(profileSlug, member.hierarchy);
  if (!template) throw new Error(`Unknown profile ${profileSlug}`);
  const memberAttrs: MemberAttributes = {
    id: member.id, dimension: member.dimension, hierarchy: member.hierarchy, slug: member.slug,
    name: member.name, cubeName: member.cubeName, imageId: member.imageId, zvalue: member.zvalue
  };
  const custom = await memberAttributes(profileSlug, memberAttrs);
  return {template, attrs: {...baseAttributes(memberAttrs, print), ...custom}};
}

async function runEngine(profileSlug: string, member: MemberRow, print: boolean, options: BuildOptions & {label?: string}): Promise<EngineRun> {
  const {template, attrs} = await engineInputs(profileSlug, member, print);
  const built = await buildVariables(template, attrs, "en", options);
  const {failed, generators, totalMs, cache: stats} = built.diagnostics;
  // one line per render with the generator cache's counters, and per incomplete render naming the
  // generators that yielded nothing
  if (failed.length || stats) {
    const counts = stats ? `; cache ${stats.hits} hit, ${stats.misses} miss, ${stats.waits} wait, ${stats.off} off, ${stats.stored} stored, redis ${Math.round(stats.redisMs)} ms${stats.enabled ? "" : " (unavailable)"}` : "";
    const line = `[report] ${failed.length ? "incomplete " : ""}${options.label ? `${options.label} ` : ""}${profileSlug}/${member.slug}: ${generators.length - failed.length}/${generators.length} generators in ${(totalMs / 1000).toFixed(1)} s${counts}${failed.length ? `; failed: ${describeFailures(failed)}` : ""}`;
    if (failed.length) console.warn(line);
    else console.log(line);
  }
  return {template, member, attrs, built};
}

/**
 * Runs the engine for an already-resolved member (shared by every caller in the request, see
 * `loadEngine`) and prepares the sections for the given selectors.
 */
export async function loadMemberReport(profileSlug: string, member: MemberRow, options: LoadOptions = {}): Promise<LoadedReport> {
  // Report variables are computed per request (the data cache sits below, in the API layer, and a
  // few generators read the clock), so tell Next explicitly instead of letting the prerender pass
  // trip over `new Date()`.
  await connection();
  const {query = {}, print = false} = options;
  const {template, attrs, built} = await loadEngine(profileSlug, member, print);
  const report = prepareReport(template, built.variables, query);
  const clientVariables = variablesForClient(report, built.variables, template.selectors);
  return {template, member, attrs, built, report, clientVariables};
}

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
 * The member whose photo illustrates a report: the member itself, or its state for a school district
 * (there are no photos of districts; the image host answers an unknown member with a stock picture).
 */
export function imageMember(member: MemberRow): MemberRow {
  if (member.dimension !== "Geography" || member.hierarchy !== SCHOOL_DISTRICT) return member;
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
