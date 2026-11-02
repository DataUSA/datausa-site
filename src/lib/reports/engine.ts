/**
 * The report engine: turns a report template plus a resolved dimension member into the variables
 * and prepared sections a page renders. It reproduces the behaviour of Canon CMS's mortarRoute
 * (generators → materializers → variable swap) with plain typed functions instead of eval.
 */
import {formatters} from "@/content/formatters";
import {libs} from "@/lib/content/libs";
import {fetchData, fetchJsonRaw, GEOSERVICE_URL, TESSERACT_URL, type FetchResult} from "@/lib/api/tesseract";
import {fetchLegacyEndpoint, isLegacyEndpoint} from "@/lib/api/legacy-endpoints";
import {withUpstreamScope} from "@/lib/api/upstream-scope";
import {generatorCacheEnabled, resolveGenerators, type CacheState, type CacheStats, type FailureKind, type GeneratorResult, type GroupComputation, type ResolvedGenerator} from "@/lib/cache/generator-cache";
import {scopeTags} from "@/lib/cache/values";
import {injectSlugs, runLogic} from "@/lib/reports/generator-run";
import {isAllowed, selSwap, swapTemplate, varSwap, type SelectorValues} from "@/lib/template";
import type {
  ContentContext, GeneratorContext, GeneratorDefinition, MemberAttributes, ReportTemplate, SectionDefinition, SelectorDefinition,
  SelectorOption, StatBlock, TextBlock, Variables, VizManifestEntry
} from "@/lib/reports/types";

export type {FailureKind};

export interface GeneratorFailure {
  id: number;
  name: string;
  kind: FailureKind;
  /** HTTP status, when there was a response. */
  status: number;
  message: string;
}

export interface GeneratorStatus {
  id: number;
  name: string;
  url: string;
  status: number;
  durationMs: number;
  error?: string;
  failure?: FailureKind;
  variables?: string[];
  /** Where the output came from: the generator cache (`hit`), computed (`miss`), another render (`wait`), or never cached (`off`). */
  cache?: CacheState;
  /** Why a computed output was not stored. */
  uncached?: string;
}

export interface BuiltVariables {
  variables: Variables;
  diagnostics: {
    generators: GeneratorStatus[];
    /** Generators that yielded nothing, and why: the render is incomplete when this is not empty. */
    failed: GeneratorFailure[];
    materializers: {id: number; name: string; error?: string; variables?: string[]}[];
    totalMs: number;
    /** Generator cache counters of the render; absent when the cache is off (no Redis or manifest). */
    cache?: CacheStats;
  };
}

export interface BuildOptions {
  /** Awaited before each upstream request of the render (the warmer's rate limit). */
  throttle?: () => Promise<void>;
  /** `bypass` renders without the generator cache (diagnostics: compare with a cached render). */
  cache?: "auto" | "bypass";
}

const MAX_CONCURRENT_REQUESTS = Number(process.env.API_MAX_CONCURRENCY ?? 12);

/** Minimal concurrency limiter for the generator fan-out. */
export async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({length: Math.min(limit, items.length)}, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

export function contentContext(locale = "en"): ContentContext {
  return {libs, formatters, locale};
}

/** Base attributes every report starts with (Canon's `smallAttr`). */
export function baseAttributes(member: MemberAttributes, print = false): Variables {
  const attrs: Variables = {
    id: member.id,
    dimension: member.dimension,
    hierarchy: member.hierarchy,
    slug: member.slug,
    name: member.name,
    cubeName: member.cubeName,
    user: false,
    showWhenPrinting: !print,
    tesseract: TESSERACT_URL,
    geoservice: GEOSERVICE_URL,
    locale: "en"
  };
  // Canon also exposed every attribute suffixed with the dimension index (id1, slug1, ...).
  ["id", "dimension", "hierarchy", "slug", "name", "cubeName"].forEach(key => { attrs[`${key}1`] = attrs[key]; });
  return attrs;
}

/** Fetches a generator URL: absolute URLs go to the data client, legacy paths to in-process handlers. */
async function fetchGeneratorUrl(url: string, attrs: Variables): Promise<FetchResult<unknown>> {
  if (isLegacyEndpoint(url)) return fetchLegacyEndpoint(url, attrs);
  if (/^https?:\/\//.test(url)) return fetchData<unknown>(url);
  return fetchJsonRaw<unknown>(`${TESSERACT_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`);
}

/** Generators that read the same URL, in template order: they share one response. */
interface UrlGroup {
  url: string;
  generators: GeneratorDefinition[];
}

/**
 * Fetches a group's URL once and runs its generators' logic in template order. Generators that
 * share a URL share the response object, and some of them add columns to it for the ones after
 * them, so a group is always computed together. The fetch runs in an upstream scope that records
 * what it read (tags) and whether any read failed; with the generator cache on it fetches directly
 * (`uncached`), since the cache holds the outputs.
 */
async function computeGroup(group: UrlGroup, attrs: Variables, ctx: GeneratorContext, options: BuildOptions, uncached: boolean): Promise<GroupComputation> {
  if (group.url.startsWith("error:")) {
    return {status: 0, durationMs: 0, results: group.generators.map(() => ({ok: false, kind: "url", message: group.url.slice(6)})), tags: null, upstreamFailures: []};
  }
  await options.throttle?.();
  const {value: result, scope} = await withUpstreamScope(() => fetchGeneratorUrl(group.url, attrs), {uncached});
  if (result.data) injectSlugs(group.url, result.data, attrs.dimension);
  const results = group.generators.map((g): GeneratorResult => {
    if (!result.data) return {ok: false, kind: result.failure ?? (result.status >= 400 ? "http" : result.error ? "network" : "no-data"), message: result.error ?? "Invalid API Link"};
    return runLogic(g, result.data, ctx);
  });
  return {status: result.status, durationMs: result.durationMs, results, tags: scopeTags(scope.urls, scope.tags), upstreamFailures: scope.failures};
}

/** Runs the template's generators and materializers for the given attributes. */
export async function buildVariables(template: ReportTemplate, attrs: Variables, locale = "en", options: BuildOptions = {}): Promise<BuiltVariables> {
  const started = performance.now();
  const ctx = contentContext(locale);
  const generators = template.generators.filter(g => isAllowed(g.allowed, attrs));
  const groups: UrlGroup[] = [];
  const groupOf = new Map<string, UrlGroup>();
  const urlFor = new Map<GeneratorDefinition, string>();
  for (const g of generators) {
    let url: string;
    try {
      url = g.api(attrs);
    }
    catch (error) {
      url = `error:${(error as Error).message}`;
    }
    urlFor.set(g, url);
    let group = groupOf.get(url);
    if (!group) {
      group = {url, generators: []};
      groupOf.set(url, group);
      groups.push(group);
    }
    group.generators.push(g);
  }

  const genCtx: GeneratorContext = {...ctx, variables: attrs};
  let outcome: Map<GeneratorDefinition, ResolvedGenerator>;
  let cacheStats: CacheStats | undefined;
  if (options.cache !== "bypass" && generatorCacheEnabled()) {
    // read every output at once, compute only the missing ones (see src/lib/cache/generator-cache.ts)
    const resolved = await resolveGenerators({
      profile: template.meta.slug,
      memberId: String(attrs.id),
      attrs,
      groups,
      compute: group => computeGroup(group, attrs, genCtx, options, true),
      concurrency: MAX_CONCURRENT_REQUESTS,
      limit: mapWithConcurrency
    });
    outcome = resolved.resolved;
    cacheStats = resolved.stats;
  }
  else {
    outcome = new Map();
    await mapWithConcurrency(groups, MAX_CONCURRENT_REQUESTS, async group => {
      const computed = await computeGroup(group, attrs, genCtx, options, false);
      group.generators.forEach((g, i) => outcome.set(g, {result: computed.results[i], status: computed.status, durationMs: computed.durationMs, cache: "off"}));
    });
  }

  // merged in template order: later generators win
  let variables: Variables = {...attrs};
  const statuses: GeneratorStatus[] = [];
  const failed: GeneratorFailure[] = [];
  for (const g of generators) {
    const {result, status: httpStatus, durationMs, cache, uncached} = outcome.get(g)!;
    const status: GeneratorStatus = {id: g.id, name: g.name, url: urlFor.get(g)!, status: httpStatus, durationMs, ...(cacheStats ? {cache, uncached} : {})};
    if (result.ok) {
      if (result.output) {
        variables = {...variables, ...result.output};
        status.variables = Object.keys(result.output);
      }
    }
    else {
      status.error = result.message;
      status.failure = result.kind;
      failed.push({id: g.id, name: g.name, kind: result.kind, status: httpStatus, message: result.message});
    }
    statuses.push(status);
  }

  const matStatuses: BuiltVariables["diagnostics"]["materializers"] = [];
  const materializers = template.materializers
    .filter(m => isAllowed(m.allowed, variables))
    .sort((a, b) => a.ordering - b.ordering);
  const swap = (s: string) => swapTemplate(s, {variables});
  for (const m of materializers) {
    try {
      const vars = m.logic(variables, {...ctx, swap});
      if (vars && typeof vars === "object") {
        variables = {...variables, ...vars};
        matStatuses.push({id: m.id, name: m.name, variables: Object.keys(vars)});
      }
      else matStatuses.push({id: m.id, name: m.name});
    }
    catch (error) {
      matStatuses.push({id: m.id, name: m.name, error: (error as Error).message});
    }
  }

  return {variables, diagnostics: {generators: statuses, failed, materializers: matStatuses, totalMs: performance.now() - started, ...(cacheStats ? {cache: cacheStats} : {})}};
}

/** One line summing up the failed generators of a render (`127 http 404, 728 http 400`). */
export function describeFailures(failed: GeneratorFailure[]): string {
  return failed.map(f => `${f.id} ${f.kind}${f.status ? ` ${f.status}` : ""}`).join(", ");
}

// ---------------------------------------------------------------------------------------------
// Preparation: selectors, visibility and text substitution (Canon prepareProfile/varSwapRecursive)
// ---------------------------------------------------------------------------------------------

export interface PreparedSelector {
  name: string;
  title: string;
  type: "single" | "multi";
  /** Current value (query param when valid, else the resolved default). */
  value: string;
  options: {option: string; label: string}[];
}

export interface PreparedText {
  id: number;
  html: string;
}

export interface PreparedStat {
  id: number;
  title: string;
  value: string;
  subtitle: string;
  tooltip: string;
}

export interface PreparedViz {
  id: number;
  ordering: number;
  usedVariables: string[] | null;
  usedVariablePrefixes: string[];
  usedVariableTemplates: string[];
  types: string[];
}

export interface PreparedSection {
  id: number;
  slug: string;
  type: SectionDefinition["type"];
  position: string;
  icon: string;
  title: string;
  short: string;
  subtitles: PreparedText[];
  descriptions: PreparedText[];
  stats: PreparedStat[];
  selectors: PreparedSelector[];
  visualizations: PreparedViz[];
  /** Raw templates, kept only for sections that have selectors so the client can re-render them. */
  templates?: {title: string; subtitles: TextBlock[]; descriptions: TextBlock[]; stats: StatBlock[]};
}

export interface PreparedReport {
  slug: string;
  title: string;
  label: string;
  sections: PreparedSection[];
  selectors: SelectorValues;
  /** Labels of dynamic selector options (used by the client-side swap). */
  labels: Variables;
}

export type SelectorQuery = Record<string, string | string[] | undefined>;

function scaffoldDynamic(value: unknown): SelectorOption[] | null {
  if (!Array.isArray(value) || !value.length) return null;
  if (!value.every(d => typeof d === "string" || (d && typeof d === "object" && "option" in d))) return null;
  return value.map(d => typeof d === "string" ? {option: d, allowed: "always", label: d} : {allowed: "always", label: (d as SelectorOption).option, ...(d as SelectorOption)});
}

function queryValue(query: SelectorQuery, name: string): string[] | false {
  const raw = query[name];
  if (raw === undefined) return false;
  return typeof raw === "string" ? raw.split(",") : raw;
}

/**
 * Resolves every selector of the profile to its current value: the query parameter when it names a
 * valid option, otherwise the default (which may be a `{{variable}}` or reference other selectors).
 */
export function resolveSelectors(definitions: SelectorDefinition[], variables: Variables, query: SelectorQuery): {values: SelectorValues; labels: Variables; options: Map<string, SelectorOption[]>} {
  const values: SelectorValues = {};
  const labels: Variables = {};
  const optionsByName = new Map<string, SelectorOption[]>();
  const deferred: SelectorDefinition[] = [];

  for (const s of definitions) {
    let options: SelectorOption[] = [];
    if (s.dynamic) {
      const scaffolded = scaffoldDynamic(variables[s.dynamic]);
      if (scaffolded) {
        options = scaffolded;
        scaffolded.forEach(o => { labels[o.option] = o.label ?? o.option; });
      }
    }
    else options = s.options;
    optionsByName.set(s.name, options);
    const selections = queryValue(query, s.name);
    const isBlankMulti = selections && selections.length === 1 && selections[0] === "";
    if (selections && (selections.every(sel => options.some(o => o.option === sel)) || isBlankMulti)) {
      values[s.name] = selections.join(",");
    }
    else {
      values[s.name] = varSwap(s.default, variables);
      if (s.default.includes("[[")) deferred.push(s);
    }
  }
  // Defaults that reference other selectors need a second pass once every value is known.
  for (const s of deferred) {
    const options = optionsByName.get(s.name) ?? [];
    const relevant = options.filter(o => isAllowed(o.allowed, variables, values));
    const newDefault = varSwap(selSwap(s.default, values), variables);
    const needsFixing = values[s.name] === "N/A" || !relevant.some(o => o.option === values[s.name]);
    if (needsFixing) {
      if (newDefault !== "N/A") {
        if (relevant.some(o => o.option === newDefault)) values[s.name] = newDefault;
      }
      else if (relevant.length) values[s.name] = relevant[0].option;
    }
  }
  return {values, labels, options: optionsByName};
}

/** Prepares the whole report for rendering: visibility, selectors and text substitution. */
export function prepareReport(template: ReportTemplate, variables: Variables, query: SelectorQuery = {}): PreparedReport {
  const {values: selectors, labels, options} = resolveSelectors(template.selectors, variables, query);
  const swap = (s: string) => swapTemplate(s, {variables, selectors, labels});
  const allowed = (rule: string) => isAllowed(rule, variables, selectors);
  const vizBySection = new Map<number, VizManifestEntry[]>();
  template.visualizations.forEach(v => {
    if (!vizBySection.has(v.sectionId)) vizBySection.set(v.sectionId, []);
    vizBySection.get(v.sectionId)!.push(v);
  });

  // A hidden Grouping hides every section until the next Grouping (Canon copies its rule down).
  let groupingRule = "always";
  const sections: PreparedSection[] = [];
  for (const s of [...template.sections].sort((a, b) => a.ordering - b.ordering)) {
    if (s.type === "Grouping") groupingRule = s.allowed;
    const rule = s.type === "Grouping" || allowed(groupingRule) ? s.allowed : groupingRule;
    if (!allowed(rule)) continue;

    const prepSelectors: PreparedSelector[] = s.selectors.map(name => {
      const def = template.selectors.find(d => d.name === name);
      if (!def) return null;
      const opts = (options.get(name) ?? []).filter(o => allowed(o.allowed ?? "always"));
      return {
        name,
        title: def.title,
        type: def.type,
        value: selectors[name] ?? "",
        options: opts.map(o => ({option: o.option, label: swap(String(variables[o.label ?? o.option] ?? o.label ?? o.option))}))
      };
    }).filter((x): x is PreparedSelector => Boolean(x));

    sections.push({
      id: s.id,
      slug: s.slug,
      type: s.type,
      position: s.position,
      icon: s.icon,
      title: swap(s.title),
      short: swap(s.short),
      subtitles: s.subtitles.filter(t => allowed(t.allowed)).map(t => ({id: t.id, html: swap(t.text)})),
      descriptions: s.descriptions.filter(t => allowed(t.allowed)).map(t => ({id: t.id, html: swap(t.text)})),
      stats: s.stats.filter(t => allowed(t.allowed)).map(t => ({id: t.id, title: swap(t.title), value: swap(t.value), subtitle: swap(t.subtitle), tooltip: swap(t.tooltip)})),
      selectors: prepSelectors,
      visualizations: (vizBySection.get(s.id) ?? [])
        .filter(v => allowed(v.allowed))
        .sort((a, b) => a.ordering - b.ordering)
        .map(v => ({id: v.id, ordering: v.ordering, usedVariables: v.usedVariables, usedVariablePrefixes: v.usedVariablePrefixes, usedVariableTemplates: v.usedVariableTemplates, types: v.types})),
      ...(prepSelectors.length ? {templates: {title: s.title, subtitles: s.subtitles, descriptions: s.descriptions, stats: s.stats}} : {})
    });
  }

  const hero = sections.find(s => s.type === "Hero");
  return {
    slug: template.meta.slug,
    title: hero?.title ?? swap(`{{name}}`),
    label: template.meta.label,
    sections,
    selectors,
    labels
  };
}

/** Collects the variable keys the page's visible charts need, or `null` if any chart needs everything. */
export function variablesForClient(report: PreparedReport, variables: Variables, selectorDefinitions: SelectorDefinition[] = []): Variables {
  const keys = new Set<string>(["id", "dimension", "hierarchy", "slug", "name", "cubeName", "tesseract", "geoservice", "locale"]);
  const prefixes = new Set<string>();
  const optionsFor = (name: string) => {
    const def = selectorDefinitions.find(d => d.name === name);
    const opts = def ? (def.dynamic ? (scaffoldDynamic(variables[def.dynamic]) ?? []) : def.options).map(o => o.option) : [];
    const current = report.selectors[name];
    return current ? Array.from(new Set([...opts, current])) : opts;
  };
  for (const section of report.sections) {
    for (const viz of section.visualizations) {
      if (viz.usedVariables === null) return variables;
      viz.usedVariables.forEach(k => keys.add(k));
      viz.usedVariablePrefixes.forEach(p => prefixes.add(p));
      // `variables[swap("[[sel]]Level")]` -> one key per option of that selector
      viz.usedVariableTemplates.forEach(template => {
        const names = Array.from(template.matchAll(/\[\[([^\]]+)\]\]/g)).map(m => m[1]);
        if (!names.length) { keys.add(template); return; }
        let variants = [template];
        for (const name of names) {
          const opts = optionsFor(name);
          variants = variants.flatMap(t => (opts.length ? opts : [""]).map(o => t.split(`[[${name}]]`).join(o)));
        }
        variants.forEach(k => keys.add(varSwap(k, variables)));
      });
    }
    // selector option labels and swapped titles may be re-rendered client-side
    section.selectors.forEach(sel => sel.options.forEach(o => keys.add(o.option)));
  }
  const out: Variables = {};
  keys.forEach(k => { if (k in variables) out[k] = variables[k]; });
  if (prefixes.size) {
    const list = Array.from(prefixes);
    Object.keys(variables).forEach(k => { if (list.some(p => k.startsWith(p))) out[k] = variables[k]; });
  }
  return out;
}
