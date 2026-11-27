/**
 * Development diagnostics: runs the report engine for `?slug=geo&id=massachusetts` and returns the
 * generator/materializer status, timings and variable counts (`&generators=all` lists every generator
 * and materializer with the variables it set and, with the generator cache on, whether its output
 * was a hit, a miss, a wait on another render, or never cached and why). `&cache=bypass` renders
 * without the generator cache. Disabled in production unless ENABLE_DEBUG_ROUTES=true.
 *
 * Headers: `x-report-generators: <ok>/<total>` and, with the cache on, `x-gen-cache: <hits>/<total>`.
 */
import {connection, NextResponse} from "next/server";
import {warmerStats} from "@/lib/cache/warmer";
import {prepareReport} from "@/lib/reports/engine";
import {loadEngine} from "@/lib/reports/load";
import {resolveReportUrl} from "@/lib/reports/resolve";

export async function GET(request: Request) {
  await connection(); // always computed per request, never prerendered
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEBUG_ROUTES !== "true") {
    return NextResponse.json({error: "disabled"}, {status: 404});
  }
  const {searchParams} = new URL(request.url);
  const slug = searchParams.get("slug") ?? "geo";
  const id = searchParams.get("id") ?? "massachusetts";
  const started = Date.now();
  const resolved = resolveReportUrl(slug, id);
  if (resolved.status !== "ok") return NextResponse.json({status: resolved.status, ...("to" in resolved ? {to: resolved.to} : {})}, {status: 404});
  const {member} = resolved;
  const {built, template} = await loadEngine(slug, member, false, {cache: searchParams.get("cache") === "bypass" ? "bypass" : "auto", label: "debug"});
  const report = prepareReport(template, built.variables);
  const failed = built.diagnostics.generators.filter(g => g.error);
  const total = built.diagnostics.generators.length;
  const cache = built.diagnostics.cache;
  const headers: Record<string, string> = {"x-report-generators": `${total - failed.length}/${total}`};
  if (cache) headers["x-gen-cache"] = `${cache.hits}/${cache.total}`;
  return NextResponse.json({
    member,
    totalMs: Date.now() - started,
    engineMs: built.diagnostics.totalMs,
    variables: Object.keys(built.variables).length,
    variablesBytes: JSON.stringify(built.variables).length,
    sections: report.sections.map(s => ({slug: s.slug, type: s.type, stats: s.stats.length, descriptions: s.descriptions.length, vizzes: s.visualizations.map(v => v.id), selectors: s.selectors.map(x => `${x.name}=${x.value}`)})),
    generators: {total, failed: failed.map(g => ({id: g.id, name: g.name, url: g.url, status: g.status, failure: g.failure, error: g.error}))},
    cache: cache ? {...cache, summary: `${cache.hits}/${cache.total} hits, ${cache.misses} misses, ${cache.waits} waits, ${cache.off} off`} : null,
    uncached: cache ? built.diagnostics.generators.filter(g => g.uncached).map(g => ({id: g.id, name: g.name, reason: g.uncached})) : undefined,
    warmer: warmerStats(),
    materializers: built.diagnostics.materializers.filter(m => m.error),
    slowest: [...built.diagnostics.generators].sort((a, b) => b.durationMs - a.durationMs).slice(0, 5).map(g => ({id: g.id, name: g.name, ms: g.durationMs})),
    all: searchParams.get("generators") === "all" ? {generators: built.diagnostics.generators, materializers: built.diagnostics.materializers} : undefined,
    full: searchParams.get("full") === "true" ? {variables: built.variables, report} : undefined
  }, {headers});
}
