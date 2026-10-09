/**
 * One-time extraction of the legacy Canon CMS content into version-controlled TypeScript.
 *
 *   npm run extract:legacy -- --profile geo            # one profile
 *   npm run extract:legacy -- --all                    # every visible profile
 *   npm run extract:legacy -- --profile geo --out ./scripts/legacy-export/out   # candidate output only
 *
 * For every profile this writes `src/content/reports/<slug>/{profile,sections,selectors}.ts`,
 * one module per generator / materializer / visualization plus their indexes, and a manifest
 * (`scripts/legacy-export/manifest.json` + `manifest.md`) that accounts for every source record and
 * lists patterns needing manual review. Hand-written files (`attributes.ts`) are never overwritten.
 */
import {mkdirSync, writeFileSync, existsSync} from "node:fs";
import {join, resolve} from "node:path";
import {connectReadOnly, readCmsTables, contentFor, type CmsTables, type Row} from "./db";
import {
  annotateImplicitAnyParams, auditBody, collectUsedVariables, collectVizTypes, convertUrlTemplate, declareImplicitGlobals,
  fixLegacyIdioms, indent, kebab, loosenDeclarations, replaceWindowGlobals, wrapTemplateStrings, type ConversionWarning
} from "./convert";
import {patches} from "./patches";

interface Args { profiles: string[] | "all"; out: string; }

function parseArgs(argv: string[]): Args {
  const args: Args = {profiles: [], out: resolve("src/content/reports")};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") args.profiles = "all";
    else if (a === "--profile") { if (args.profiles !== "all") args.profiles.push(argv[++i]); }
    else if (a === "--out") args.out = resolve(argv[++i]);
  }
  if (args.profiles !== "all" && !args.profiles.length) throw new Error("Pass --profile <slug> or --all");
  return args;
}

interface ManifestRecord {
  table: string;
  id: number;
  name?: string;
  file: string;
  warnings: ConversionWarning[];
}

interface ProfileManifest {
  slug: string;
  profileId: number;
  counts: Record<string, number>;
  records: ManifestRecord[];
}

const HEADER = (table: string, id: number, name: string, slug: string) =>
  `// Converted from legacy ${table} #${id}${name ? ` "${name.replace(/\n/g, " ")}"` : ""} (profile: ${slug}) by scripts/legacy-export/extract.ts.\n` +
  "// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.\n" +
  "/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */\n";

/** Applies the hand-reviewed patch for a record (if any) and returns the body plus warnings. */
function applyPatch(kind: string, id: number, body: string, warnings: ConversionWarning[]): string {
  const patch = patches[`${kind}:${id}`];
  if (!patch) return body;
  let out = body;
  (patch.replace ?? []).forEach(([from, to]) => {
    if (!out.includes(from)) warnings.push({code: "patch-not-applied", message: `patch text not found: ${from.slice(0, 60)}`});
    out = out.split(from).join(to);
  });
  if (patch.declare?.length) out = `${patch.declare.map(n => `let ${n}: any;`).join(" ")}\n${out}`;
  warnings.push({code: "patched", message: patch.note});
  return out;
}

/** The full body conversion pipeline shared by generators, materializers and visualizations. */
function convertBody(body: string, warnings: ConversionWarning[]): string {
  let code = fixLegacyIdioms(body);
  code = annotateImplicitAnyParams(code);
  code = loosenDeclarations(code);
  const globals = declareImplicitGlobals(code);
  if (globals.declared.length) warnings.push({code: "implicit-globals-declared", message: `declared sloppy-mode globals: ${globals.declared.join(", ")}`});
  return globals.code;
}

function usedNames(body: string, candidates: string[]): string[] {
  return candidates.filter(name => new RegExp(`\\b${name}\\b`).test(body));
}

function sortByOrdering<T extends Row>(rows: T[]): T[] {
  return [...rows].sort((a, b) => (a.ordering ?? 0) - (b.ordering ?? 0) || a.id - b.id);
}

function write(path: string, content: string) {
  mkdirSync(join(path, ".."), {recursive: true});
  writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function emitProfile(tables: CmsTables, meta: Row, outRoot: string): ProfileManifest {
  const slug: string = meta.slug;
  const pid: number = meta.profile_id;
  const dir = join(outRoot, slug);
  const manifest: ProfileManifest = {slug, profileId: pid, counts: {}, records: []};
  const record = (r: ManifestRecord) => manifest.records.push(r);

  const profile = tables.profile.find(p => p.id === pid)!;
  const pcontent = contentFor(tables.profile_content, pid);

  // ---- profile.ts
  const profileMeta = {
    id: pid,
    slug,
    dimension: meta.dimension,
    levels: meta.levels,
    measure: meta.measure,
    cubeName: meta.cubeName,
    title: pcontent.title ?? "",
    subtitle: pcontent.subtitle ?? "",
    label: pcontent.label ?? ""
  };
  write(join(dir, "profile.ts"),
    `// Converted from legacy canon_cms_profile #${pid} / canon_cms_profile_meta #${meta.id} (ordering ${profile.ordering}, visible ${profile.visible}).\n` +
    `import type {ProfileMeta} from "@/lib/reports/types";\n\nexport const meta: ProfileMeta = ${JSON.stringify(profileMeta, null, 2)};\n`);
  record({table: "canon_cms_profile", id: pid, name: pcontent.title, file: `${slug}/profile.ts`, warnings: []});
  record({table: "canon_cms_profile_meta", id: meta.id, name: slug, file: `${slug}/profile.ts`, warnings: []});
  record({table: "canon_cms_profile_content", id: pid, name: pcontent.title, file: `${slug}/profile.ts`, warnings: []});

  // ---- selectors.ts
  const selectorRows = tables.selector.filter(s => s.profile_id === pid).sort((a, b) => a.id - b.id);
  const selectors = selectorRows.map(s => ({
    id: s.id,
    name: s.name,
    title: s.title ?? "",
    type: s.type ?? "single",
    default: s.default ?? "",
    options: (s.options ?? []).map((o: Row | string) => typeof o === "string" ? {option: o, allowed: "always"} : {option: o.option, allowed: o.allowed ?? "always", ...(o.label ? {label: o.label} : {})}),
    ...(s.dynamic ? {dynamic: s.dynamic} : {})
  }));
  write(join(dir, "selectors.ts"),
    `// Converted from legacy canon_cms_selector rows with profile_id = ${pid}.\n` +
    `import type {SelectorDefinition} from "@/lib/reports/types";\n\nexport const selectors: SelectorDefinition[] = ${JSON.stringify(selectors, null, 2)};\n`);
  selectorRows.forEach(s => record({table: "canon_cms_selector", id: s.id, name: s.name, file: `${slug}/selectors.ts`, warnings: []}));
  manifest.counts.selectors = selectorRows.length;

  // ---- sections.ts
  const sectionRows = sortByOrdering(tables.section.filter(s => s.profile_id === pid));
  const sectionById = new Map<number, Row>(sectionRows.map(s => [s.id, s]));
  const vizRows = tables.section_visualization.filter(v => sectionById.has(v.section_id));
  const sections = sectionRows.map(s => {
    const c = contentFor(tables.section_content, s.id);
    const subs = sortByOrdering(tables.section_subtitle.filter(x => x.section_id === s.id));
    const descs = sortByOrdering(tables.section_description.filter(x => x.section_id === s.id));
    const stats = sortByOrdering(tables.section_stat.filter(x => x.section_id === s.id));
    const sels = sortByOrdering(tables.section_selector.filter(x => x.section_id === s.id));
    const vizzes = sortByOrdering(vizRows.filter(v => v.section_id === s.id));
    subs.forEach(x => record({table: "canon_cms_section_subtitle", id: x.id, file: `${slug}/sections.ts`, warnings: []}));
    descs.forEach(x => record({table: "canon_cms_section_description", id: x.id, file: `${slug}/sections.ts`, warnings: []}));
    stats.forEach(x => record({table: "canon_cms_section_stat", id: x.id, file: `${slug}/sections.ts`, warnings: []}));
    sels.forEach(x => record({table: "canon_cms_section_selector", id: x.id, file: `${slug}/sections.ts`, warnings: []}));
    record({table: "canon_cms_section", id: s.id, name: s.slug, file: `${slug}/sections.ts`, warnings: []});
    return {
      id: s.id,
      slug: s.slug || `section-${s.id}`,
      type: s.type,
      ordering: s.ordering ?? 0,
      allowed: s.allowed || "always",
      position: s.position || "default",
      icon: s.icon || "",
      title: c.title ?? "",
      short: c.short ?? "",
      subtitles: subs.map(x => ({id: x.id, allowed: x.allowed || "always", text: contentFor(tables.section_subtitle_content, x.id).subtitle ?? ""})),
      descriptions: descs.map(x => ({id: x.id, allowed: x.allowed || "always", text: contentFor(tables.section_description_content, x.id).description ?? ""})),
      stats: stats.map(x => {
        const sc = contentFor(tables.section_stat_content, x.id);
        return {id: x.id, allowed: x.allowed || "always", title: sc.title ?? "", value: sc.value ?? "", subtitle: sc.subtitle ?? "", tooltip: sc.tooltip ?? ""};
      }),
      selectors: sels.map(x => selectorRows.find(sr => sr.id === x.selector_id)?.name).filter(Boolean),
      visualizations: vizzes.map(v => v.id)
    };
  });
  write(join(dir, "sections.ts"),
    `// Converted from legacy canon_cms_section rows (and their subtitle/description/stat/selector/visualization children) with profile_id = ${pid}.\n` +
    "// Text keeps the CMS template syntax: {{variable}}, Formatter{{variable}} and [[selector]] (rendered by src/lib/template.ts).\n" +
    `import type {SectionDefinition} from "@/lib/reports/types";\n\nexport const sections: SectionDefinition[] = ${JSON.stringify(sections, null, 2)};\n`);
  manifest.counts.sections = sectionRows.length;

  // ---- generators
  const genRows = tables.generator.filter(g => g.profile_id === pid).sort((a, b) => a.id - b.id);
  const genFiles: string[] = [];
  genRows.forEach(g => {
    const stem = `${g.id}-${kebab(g.name, "generator")}`;
    const warnings: ConversionWarning[] = [];
    const url = convertUrlTemplate(g.api ?? "");
    warnings.push(...url.warnings);
    let body = g.logic ?? "return {};";
    warnings.push(...auditBody(body, "generator"));
    body = applyPatch("generator", g.id, body, warnings);
    body = convertBody(body, warnings);
    const ctxNames = usedNames(body, ["libs", "formatters", "locale", "variables"]);
    const src = HEADER("canon_cms_generator", g.id, g.name, slug) +
      `import type {GeneratorDefinition} from "@/lib/reports/types";\n\n` +
      `const generator: GeneratorDefinition = {\n` +
      `  id: ${g.id},\n  name: ${JSON.stringify(g.name ?? "")},\n  allowed: ${JSON.stringify(g.allowed || "always")},\n` +
      `  api: attrs => ${url.code},\n` +
      `  logic: (resp${ctxNames.length ? `, {${ctxNames.join(", ")}}` : ""}) => {\n${indent(body, 4)}\n  }\n};\n\nexport default generator;\n`;
    write(join(dir, "generators", `${stem}.ts`), src);
    genFiles.push(stem);
    record({table: "canon_cms_generator", id: g.id, name: g.name, file: `${slug}/generators/${stem}.ts`, warnings});
  });
  write(join(dir, "generators", "index.ts"),
    `// Generators of the ${slug} profile in legacy id order (Canon ran them in this order and merged the results).\n` +
    `import type {GeneratorDefinition} from "@/lib/reports/types";\n` +
    genFiles.map((f, i) => `import g${i} from "./${f}";`).join("\n") +
    `\n\nexport const generators: GeneratorDefinition[] = [${genFiles.map((_f, i) => `g${i}`).join(", ")}];\n`);
  manifest.counts.generators = genRows.length;

  // ---- materializers
  const matRows = sortByOrdering(tables.materializer.filter(m => m.profile_id === pid));
  const matFiles: string[] = [];
  matRows.forEach(m => {
    const stem = `${String(m.ordering ?? 0).padStart(2, "0")}-${m.id}-${kebab(m.name, "materializer")}`;
    const warnings = auditBody(m.logic ?? "", "materializer");
    let body = m.logic ?? "return {};";
    const wrapped = wrapTemplateStrings(body);
    body = wrapped.code;
    if (wrapped.count) warnings.push({code: "template-strings-wrapped", message: `${wrapped.count} string literal(s) wrapped in swap()`});
    body = applyPatch("materializer", m.id, body, warnings);
    body = convertBody(body, warnings);
    const ctxNames = usedNames(body, ["libs", "formatters", "locale", "swap"]);
    const src = HEADER("canon_cms_materializer", m.id, m.name, slug) +
      `import type {MaterializerDefinition} from "@/lib/reports/types";\n\n` +
      `const materializer: MaterializerDefinition = {\n` +
      `  id: ${m.id},\n  name: ${JSON.stringify(m.name ?? "")},\n  ordering: ${m.ordering ?? 0},\n  allowed: ${JSON.stringify(m.allowed || "always")},\n` +
      `  logic: (variables${ctxNames.length ? `, {${ctxNames.join(", ")}}` : ""}) => {\n${indent(body, 4)}\n  }\n};\n\nexport default materializer;\n`;
    write(join(dir, "materializers", `${stem}.ts`), src);
    matFiles.push(stem);
    record({table: "canon_cms_materializer", id: m.id, name: m.name, file: `${slug}/materializers/${stem}.ts`, warnings});
  });
  write(join(dir, "materializers", "index.ts"),
    `// Materializers of the ${slug} profile sorted by legacy ordering (later ones read the output of earlier ones).\n` +
    `import type {MaterializerDefinition} from "@/lib/reports/types";\n` +
    matFiles.map((f, i) => `import m${i} from "./${f}";`).join("\n") +
    `\n\nexport const materializers: MaterializerDefinition[] = [${matFiles.map((_f, i) => `m${i}`).join(", ")}];\n`);
  manifest.counts.materializers = matRows.length;

  // ---- visualizations
  const vizSorted = [...vizRows].sort((a, b) => a.id - b.id);
  const manifestEntries: Row[] = [];
  const vizFiles: {id: number; stem: string}[] = [];
  vizSorted.forEach(v => {
    const section = sectionById.get(v.section_id)!;
    const stem = `${v.id}-${kebab(section.slug, "section")}`;
    const warnings = auditBody(v.logic ?? "", "visualization");
    let body = v.logic ?? "return {};";
    const wrapped = wrapTemplateStrings(body);
    body = wrapped.code;
    if (wrapped.count) warnings.push({code: "template-strings-wrapped", message: `${wrapped.count} string literal(s) wrapped in swap()`});
    const globals = replaceWindowGlobals(body);
    body = globals.code;
    body = applyPatch("visualization", v.id, body, warnings);
    body = convertBody(body, warnings);
    const used = collectUsedVariables(v.logic ?? "");
    if (used.dynamic) warnings.push({code: "dynamic-variable-access", message: "reads variables dynamically; all variables will be sent to the client for this chart"});
    const types = collectVizTypes(v.logic ?? "");
    if (!types.length) warnings.push({code: "no-chart-type", message: "no literal type: \"X\" found in config"});
    const ctxNames = usedNames(body, ["libs", "formatters", "locale", "swap", "albersUsaPr"]);
    const src = HEADER("canon_cms_section_visualization", v.id, `section ${section.slug}`, slug) +
      `import type {VizDefinition} from "@/lib/reports/types";\n\n` +
      `const viz: VizDefinition = (variables${ctxNames.length ? `, {${ctxNames.join(", ")}}` : ""}) => {\n${indent(body, 2)}\n};\n\nexport default viz;\n`;
    write(join(dir, "visualizations", `${stem}.ts`), src);
    vizFiles.push({id: v.id, stem});
    manifestEntries.push({id: v.id, sectionId: v.section_id, ordering: v.ordering ?? 0, allowed: v.allowed || "always", usedVariables: used.dynamic ? null : used.keys, usedVariablePrefixes: used.prefixes, usedVariableTemplates: used.templates, types, file: `${stem}`});
    record({table: "canon_cms_section_visualization", id: v.id, name: section.slug, file: `${slug}/visualizations/${stem}.ts`, warnings});
  });
  write(join(dir, "visualizations", "manifest.ts"),
    `// Visualization metadata of the ${slug} profile (converted from canon_cms_section_visualization). Used server-side without loading chart code.\n` +
    `import type {VizManifestEntry} from "@/lib/reports/types";\n\nexport const visualizations: VizManifestEntry[] = ${JSON.stringify(manifestEntries, null, 2)};\n`);
  write(join(dir, "visualizations", "index.ts"),
    `// Lazy registry: each chart module is only downloaded when its section renders in the browser.\n` +
    `import type {VizDefinition} from "@/lib/reports/types";\n\n` +
    `export const vizModules: Record<number, () => Promise<{default: VizDefinition}>> = {\n` +
    vizFiles.map(f => `  ${f.id}: () => import("./${f.stem}")`).join(",\n") + "\n};\n");
  manifest.counts.visualizations = vizSorted.length;

  // ---- attributes.ts stub (never overwritten) and index.ts
  const attrPath = join(dir, "attributes.ts");
  if (!existsSync(attrPath)) {
    write(attrPath,
      `// Hand-written replacement for the legacy api/customAttributes.js branch for dimension "${meta.dimension}".\n` +
      "// TODO: port the per-dimension attribute logic; see src/content/reports/geo/attributes.ts for the pattern.\n" +
      `import type {AttributeContext, MemberAttributes, Variables} from "@/lib/reports/types";\n\n` +
      `export async function attributes(member: MemberAttributes, ctx: AttributeContext): Promise<Variables> {\n  void member; void ctx;\n  return {};\n}\n`);
  }
  write(join(dir, "index.ts"),
    `// Report template for the ${slug} profile (legacy canon_cms_profile #${pid}).\n` +
    `import type {ReportTemplate} from "@/lib/reports/types";\n` +
    `import {attributes} from "./attributes";\nimport {generators} from "./generators";\nimport {materializers} from "./materializers";\n` +
    `import {meta} from "./profile";\nimport {sections} from "./sections";\nimport {selectors} from "./selectors";\nimport {visualizations} from "./visualizations/manifest";\n\n` +
    `export const template: ReportTemplate = {meta, sections, selectors, generators, materializers, visualizations, attributes};\n`);

  return manifest;
}

function summarize(manifests: ProfileManifest[], tables: CmsTables): string {
  const lines: string[] = ["# Legacy CMS extraction manifest", "", `Generated ${new Date().toISOString()}.`, ""];
  lines.push("| profile | sections | selectors | generators | materializers | visualizations | warnings |", "|---|---|---|---|---|---|---|");
  manifests.forEach(m => {
    const w = m.records.reduce((n, r) => n + r.warnings.length, 0);
    lines.push(`| ${m.slug} | ${m.counts.sections} | ${m.counts.selectors} | ${m.counts.generators} | ${m.counts.materializers} | ${m.counts.visualizations} | ${w} |`);
  });
  lines.push("", "## Source coverage", "");
  const exported = new Map<string, Set<number>>();
  manifests.forEach(m => m.records.forEach(r => {
    if (!exported.has(r.table)) exported.set(r.table, new Set());
    exported.get(r.table)!.add(r.id);
  }));
  const done = manifests.map(m => m.profileId);
  const relevant: [string, Row[]][] = [
    ["canon_cms_section", tables.section.filter(s => done.includes(s.profile_id))],
    ["canon_cms_section_visualization", tables.section_visualization.filter(v => tables.section.some(s => s.id === v.section_id && done.includes(s.profile_id)))],
    ["canon_cms_generator", tables.generator.filter(g => done.includes(g.profile_id))],
    ["canon_cms_materializer", tables.materializer.filter(g => done.includes(g.profile_id))],
    ["canon_cms_selector", tables.selector.filter(g => done.includes(g.profile_id))]
  ];
  lines.push("| table | records in scope | exported | missing ids |", "|---|---|---|---|");
  relevant.forEach(([table, rows]) => {
    const got = exported.get(table) ?? new Set();
    const missing = rows.filter(r => !got.has(r.id)).map(r => r.id);
    lines.push(`| ${table} | ${rows.length} | ${got.size} | ${missing.join(", ") || "—"} |`);
  });
  lines.push("", "## Warnings by code", "");
  const byCode = new Map<string, ManifestRecord[]>();
  manifests.forEach(m => m.records.forEach(r => r.warnings.forEach(w => {
    if (!byCode.has(w.code)) byCode.set(w.code, []);
    byCode.get(w.code)!.push(r);
  })));
  Array.from(byCode.entries()).sort((a, b) => b[1].length - a[1].length).forEach(([code, recs]) => {
    lines.push(`### ${code} (${recs.length})`, "");
    recs.slice(0, 400).forEach(r => lines.push(`- ${r.file} — ${r.table} #${r.id}${r.name ? ` "${r.name}"` : ""}`));
    lines.push("");
  });
  lines.push("## Formatters", "", `${tables.formatter.length} formatters are hand-converted in src/content/formatters/index.ts: ${tables.formatter.map(f => f.name).join(", ")}.`, "");
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const client = await connectReadOnly();
  try {
    const tables = await readCmsTables(client);
    const metas = tables.profile_meta.filter(m => m.ordering === 0 && (args.profiles === "all" ? true : args.profiles.includes(m.slug)));
    if (!metas.length) throw new Error(`No profile_meta rows match ${JSON.stringify(args.profiles)}`);
    const manifests = metas.map(meta => emitProfile(tables, meta, args.out));
    const manifestDir = resolve("scripts/legacy-export");
    writeFileSync(join(manifestDir, "manifest.json"), JSON.stringify({generatedAt: new Date().toISOString(), out: args.out, profiles: manifests}, null, 2));
    writeFileSync(join(manifestDir, "manifest.md"), summarize(manifests, tables));
    manifests.forEach(m => {
      const w = m.records.reduce((n, r) => n + r.warnings.length, 0);
      console.log(`${m.slug}: ${m.counts.sections} sections, ${m.counts.selectors} selectors, ${m.counts.generators} generators, ${m.counts.materializers} materializers, ${m.counts.visualizations} visualizations, ${w} warnings`);
    });
    console.log(`Wrote ${args.out} and scripts/legacy-export/manifest.{json,md}`);
  }
  finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
