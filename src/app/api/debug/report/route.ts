/**
 * Development diagnostics: runs the report engine for `?slug=geo&id=massachusetts` and returns the
 * generator/materializer status, timings and variable counts. Disabled in production.
 */
import {connection, NextResponse} from "next/server";
import {loadReport} from "@/lib/reports/load";

export async function GET(request: Request) {
  await connection(); // always computed per request, never prerendered
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEBUG_ROUTES !== "true") {
    return NextResponse.json({error: "disabled"}, {status: 404});
  }
  const {searchParams} = new URL(request.url);
  const slug = searchParams.get("slug") ?? "geo";
  const id = searchParams.get("id") ?? "massachusetts";
  const started = Date.now();
  const loaded = await loadReport(slug, id);
  if (loaded.status !== "ok") return NextResponse.json({status: loaded.status, ...("to" in loaded ? {to: loaded.to} : {})}, {status: 404});
  const {built, report, member} = loaded;
  const failed = built.diagnostics.generators.filter(g => g.error);
  return NextResponse.json({
    member,
    totalMs: Date.now() - started,
    engineMs: built.diagnostics.totalMs,
    variables: Object.keys(built.variables).length,
    variablesBytes: JSON.stringify(built.variables).length,
    sections: report.sections.map(s => ({slug: s.slug, type: s.type, stats: s.stats.length, descriptions: s.descriptions.length, vizzes: s.visualizations.map(v => v.id), selectors: s.selectors.map(x => `${x.name}=${x.value}`)})),
    generators: {total: built.diagnostics.generators.length, failed: failed.map(g => ({id: g.id, name: g.name, url: g.url, status: g.status, error: g.error}))},
    materializers: built.diagnostics.materializers.filter(m => m.error),
    slowest: [...built.diagnostics.generators].sort((a, b) => b.durationMs - a.durationMs).slice(0, 5).map(g => ({id: g.id, name: g.name, ms: g.durationMs})),
    full: searchParams.get("full") === "true" ? {variables: built.variables, report} : undefined
  });
}
