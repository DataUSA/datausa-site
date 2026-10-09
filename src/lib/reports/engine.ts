/**
 * The report engine: turns a report template plus a resolved dimension member into the variables
 * and prepared sections a page renders. It reproduces the behaviour of Canon CMS's mortarRoute
 * (generators → materializers → variable swap) with plain typed functions instead of eval.
 */
import {formatters} from "@/content/formatters";
import {libs} from "@/lib/content/libs";
import {fetchData, fetchJsonRaw, GEOSERVICE_URL, TESSERACT_URL} from "@/lib/api/tesseract";
import {fetchLegacyEndpoint, isLegacyEndpoint} from "@/lib/api/legacy-endpoints";
import {getMembers} from "@/lib/dimensions/db";
import {isAllowed, selSwap, swapTemplate, varSwap, type SelectorValues} from "@/lib/template";
import type {
  ContentContext, GeneratorDefinition, MemberAttributes, ReportTemplate, SectionDefinition, SelectorDefinition,
  SelectorOption, StatBlock, TextBlock, Variables, VizManifestEntry
} from "@/lib/reports/types";

export interface GeneratorStatus {
  id: number;
  name: string;
  url: string;
  status: number;
  durationMs: number;
  error?: string;
  variables?: string[];
}

export interface BuiltVariables {
  variables: Variables;
  diagnostics: {
    generators: GeneratorStatus[];
    materializers: {id: number; name: string; error?: string; variables?: string[]}[];
    totalMs: number;
  };
}

const MAX_CONCURRENT_REQUESTS = Number(process.env.API_MAX_CONCURRENCY ?? 12);

/** Minimal concurrency limiter for the generator fan-out. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
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

/** Fetches a generator URL: absolute URLs go to the cached data client, legacy paths to in-process handlers. */
async function fetchGeneratorUrl(url: string, attrs: Variables) {
  if (isLegacyEndpoint(url)) return fetchLegacyEndpoint(url, attrs);
  if (/^https?:\/\//.test(url)) return fetchData<unknown>(url);
  return fetchJsonRaw<unknown>(`${TESSERACT_URL.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`);
}

/**
 * Canon injected `<Level> Slug` columns into responses whose URL carried a `slugs=` parameter so
 * generators could build profile links. Same behaviour, backed by the dimensions database.
 */
function injectSlugs(url: string, body: unknown, dimensionName: string): void {
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

/** Runs the template's generators and materializers for the given attributes. */
export async function buildVariables(template: ReportTemplate, attrs: Variables, locale = "en"): Promise<BuiltVariables> {
  const started = performance.now();
  const ctx = contentContext(locale);
  const generators = template.generators.filter(g => isAllowed(g.allowed, attrs));
  const urlFor = new Map<GeneratorDefinition, string>();
  generators.forEach(g => {
    try {
      urlFor.set(g, g.api(attrs));
    }
    catch (error) {
      urlFor.set(g, `error:${(error as Error).message}`);
    }
  });
  const urls = Array.from(new Set(urlFor.values()));
  const responses = new Map<string, Awaited<ReturnType<typeof fetchGeneratorUrl>>>();
  await mapWithConcurrency(urls, MAX_CONCURRENT_REQUESTS, async url => {
    const result = url.startsWith("error:")
      ? {url, data: null, status: 0, error: url.slice(6), durationMs: 0}
      : await fetchGeneratorUrl(url, attrs);
    if (result.data) injectSlugs(url, result.data, attrs.dimension);
    responses.set(url, result);
  });

  let variables: Variables = {...attrs};
  const statuses: GeneratorStatus[] = [];
  const genCtx = {...ctx, variables: attrs};
  for (const g of generators) {
    const url = urlFor.get(g)!;
    const result = responses.get(url)!;
    const status: GeneratorStatus = {id: g.id, name: g.name, url, status: result.status, durationMs: result.durationMs, error: result.error};
    if (result.data) {
      try {
        const vars = g.logic(result.data, genCtx);
        if (vars && typeof vars === "object") {
          variables = {...variables, ...vars};
          status.variables = Object.keys(vars);
        }
      }
      catch (error) {
        status.error = `logic: ${(error as Error).message}`;
      }
    }
    else if (!status.error) status.error = "Invalid API Link";
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

  return {variables, diagnostics: {generators: statuses, materializers: matStatuses, totalMs: performance.now() - started}};
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
