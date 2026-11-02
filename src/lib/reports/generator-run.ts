/**
 * What every generator output goes through besides the generator's own module: the slug columns
 * injected into its response and the call of its logic. Kept apart from the engine because its
 * source is part of every generator's version in the cache manifest
 * (`scripts/cache/build-manifest.ts`): changing it changes every cached output.
 */
import {getMembers} from "@/lib/dimensions/db";
import type {GeneratorContext, GeneratorDefinition, Variables} from "@/lib/reports/types";

/** What one generator's logic produced. */
export type LogicResult =
  | {ok: true; output: Variables | undefined}
  | {ok: false; kind: "logic"; message: string};

/**
 * Canon injected `<Level> Slug` columns into responses whose URL carried a `slugs=` parameter so
 * generators could build profile links. Same behaviour, backed by the dimensions database.
 */
export function injectSlugs(url: string, body: unknown, dimensionName: string): void {
  if (!body || typeof body !== "object" || !Array.isArray((body as {data?: unknown}).data)) return;
  const slugsParam = (() => {
    try {
      return new URL(url, "http://localhost").searchParams.get("slugs");
    }
    catch {
      return null;
    }
  })();
  if (!slugsParam) return;
  const rows = (body as {data: Record<string, unknown>[]}).data;
  for (const pair of slugsParam.split(",")) {
    const [dimension, idPattern = dimension] = pair.split(":");
    const ids = Array.from(new Set(rows.map(d => String(d[`${idPattern} ID`] ?? d[idPattern]))));
    const members = getMembers(dimension || dimensionName, ids);
    const slugMap = new Map(members.map(m => [m.id, m.slug]));
    rows.forEach(d => { d[`${idPattern} Slug`] = slugMap.get(String(d[`${idPattern} ID`] ?? d[idPattern])); });
  }
}

/** Runs a generator's logic on its (slug-injected) response. Never throws. */
export function runLogic(g: GeneratorDefinition, data: unknown, ctx: GeneratorContext): LogicResult {
  try {
    const vars = g.logic(data, ctx);
    return {ok: true, output: vars && typeof vars === "object" ? vars : undefined};
  }
  catch (error) {
    return {ok: false, kind: "logic", message: `logic: ${(error as Error).message}`};
  }
}
