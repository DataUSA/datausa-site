/**
 * Writes `data/generator-manifest.json`: the version of every report generator, of the member
 * attributes of each report family and of the lookup tables, as hashes of source text and data.
 * The generator cache (`src/lib/cache/generator-cache.ts`) puts the version in every key, so a
 * deploy recomputes only what changed: editing one generator changes only its version; editing
 * code every generator runs through (libs, formatters, the logic call path, URL normalisation) or
 * the dimensions data changes all of them.
 *
 * The output must not change from one build to the next unless the inputs do: it hashes source
 * text (line endings normalised) and the `data/*.jsonl` inputs of the dimensions database, never
 * bundler output, file times, the built SQLite file, a build id or a git sha. Two builds of the same
 * commit, locally or in Docker, give byte-identical manifests (`--check <file>` compares).
 *
 *   npm run build:manifest
 *   tsx scripts/cache/build-manifest.ts --check other-manifest.json
 */
import {createHash} from "node:crypto";
import {existsSync, readdirSync, readFileSync, writeFileSync} from "node:fs";
import {dirname, join, relative, resolve} from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "../..");
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "data", "generator-manifest.json");

const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const short = (text: string) => sha(text).slice(0, 16);
const rel = (path: string) => relative(ROOT, path).split("\\").join("/");
const readText = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const lock = JSON.parse(readFileSync(join(ROOT, "package-lock.json"), "utf8")) as {packages: Record<string, {version?: string}>};

/** Version of an npm package as locked (a bare import's identity). */
function packageVersion(specifier: string): string {
  const parts = specifier.split("/");
  const name = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
  const version = lock.packages[`node_modules/${name}`]?.version;
  if (!version) throw new Error(`build-manifest: ${name} is not in package-lock.json`);
  return `${name}@${version}`;
}

const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", ".json", "/index.ts", "/index.tsx"];

function resolveLocal(from: string, specifier: string): string {
  const base = specifier.startsWith("@/") ? join(SRC, specifier.slice(2)) : resolve(dirname(from), specifier);
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate) && !candidate.endsWith("/") && !readdirSafe(candidate)) return candidate;
  }
  throw new Error(`build-manifest: cannot resolve ${specifier} from ${rel(from)}`);
}

function readdirSafe(path: string): boolean {
  try {
    readdirSync(path);
    return true;
  }
  catch {
    return false;
  }
}

/** Value imports and re-exports of a module (type-only imports do not change behaviour). */
function importsOf(text: string): string[] {
  const out: string[] = [];
  const re = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^"';]*?\s+from\s+)?["']([^"']+)["']/g;
  for (const m of text.matchAll(re)) if (!m[2]) out.push(m[3]);
  // dynamic imports
  for (const m of text.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) out.push(m[1]);
  return out;
}


/**
 * Modules that only carry cached values to and from Redis (the connection, its deadlines and its
 * circuit breaker). They decide whether a value is read, never what it is, so they are left out of
 * every closure: editing them must not re-key the cache. How values are encoded (`store.ts`) and
 * which ones are stored (`values.ts`, `generator-cache.ts`) stay in.
 */
const CACHE_TRANSPORT = new Set(["src/lib/cache/redis.ts"]);

/** Every local file and package a module depends on, with the hash of each (sorted by path). */
function closure(entry: string, exclude: Set<string> = new Set()): Map<string, string> {
  const seen = new Map<string, string>();
  const visit = (file: string) => {
    const key = rel(file);
    if (seen.has(key) || exclude.has(key) || CACHE_TRANSPORT.has(key)) return;
    const text = readText(file);
    seen.set(key, short(text));
    if (!/\.(ts|tsx|js|mjs)$/.test(file)) return;
    for (const specifier of importsOf(text)) {
      if (specifier.startsWith("node:")) continue;
      if (specifier.startsWith(".") || specifier.startsWith("@/")) visit(resolveLocal(file, specifier));
      else {
        const pkg = packageVersion(specifier);
        seen.set(`npm:${pkg}`, pkg);
      }
    }
  };
  visit(entry);
  return new Map([...seen.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

const digest = (files: Map<string, string>) => short(JSON.stringify([...files.entries()]));

// The dimensions database is rebuilt on every build, so its bytes change every time: hash its inputs.
const dimensionInputs = new Map<string, string>(
  readdirSync(join(ROOT, "data"))
    .filter(f => f.endsWith(".jsonl") || f === "profiles.json")
    .sort()
    .map(f => [`data/${f}`, short(readText(join(ROOT, "data", f)))])
);
dimensionInputs.set("scripts/legacy-export/build-dimensions.ts", short(readText(join(ROOT, "scripts/legacy-export/build-dimensions.ts"))));
const dimensionsHash = digest(dimensionInputs);

// What every generator's output goes through besides its own module.
const ENGINE_ROOTS = [
  "src/lib/content/libs.ts",
  "src/content/formatters/index.ts",
  "src/lib/reports/generator-run.ts",
  "src/lib/api/urls.ts"
];
const engineFiles = new Map<string, string>();
for (const root of ENGINE_ROOTS) closure(join(ROOT, root)).forEach((v, k) => engineFiles.set(k, v));
const engineHash = short(JSON.stringify([digest(new Map([...engineFiles.entries()].sort(([a], [b]) => a.localeCompare(b)))), dimensionsHash]));
const engineSet = new Set(engineFiles.keys());

// Generators: one module each, `src/content/reports/<family>/generators/<id>-<name>.ts`.
const generators: Record<string, string> = {};
const generatorFiles: Record<string, string> = {};
const reportsDir = join(SRC, "content", "reports");
for (const family of readdirSync(reportsDir).sort()) {
  const dir = join(reportsDir, family, "generators");
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    const m = file.match(/^(\d+)-.+\.ts$/);
    if (!m) continue;
    const path = join(dir, file);
    const declared = readText(path).match(/\n\s*id:\s*(\d+),/)?.[1];
    if (declared !== m[1]) throw new Error(`build-manifest: ${rel(path)} declares id ${declared}`);
    if (generators[m[1]]) throw new Error(`build-manifest: generator id ${m[1]} is used by ${generatorFiles[m[1]]} and ${rel(path)}`);
    generators[m[1]] = short(JSON.stringify([engineHash, digest(closure(path, engineSet))]));
    generatorFiles[m[1]] = rel(path);
  }
}

// In-process answers to `/api/...` generator URLs: part of the response of the generators that call them.
const legacyHash = short(JSON.stringify([engineHash, digest(closure(join(SRC, "lib/api/legacy-endpoints.ts")))]));

// Member attributes, per template, and the lookup tables they read.
const attributes: Record<string, string> = {};
for (const family of readdirSync(reportsDir).sort()) {
  const path = join(reportsDir, family, "attributes.ts");
  if (existsSync(path)) attributes[family] = short(JSON.stringify([dimensionsHash, digest(closure(path))]));
}
attributes["geo/school-district"] = short(JSON.stringify([dimensionsHash, digest(closure(join(reportsDir, "geo", "school-district.ts")))]));
const lookupsHash = digest(closure(join(SRC, "lib/content/lookups.ts")));

const manifest = {
  format: 1,
  engine: engineHash,
  dimensions: dimensionsHash,
  legacy: legacyHash,
  lookups: lookupsHash,
  attributes,
  generators,
  engineFiles: [...engineSet].sort()
};
const text = `${JSON.stringify(manifest, null, 1)}\n`;

const checkIndex = process.argv.indexOf("--check");
if (checkIndex >= 0) {
  const other = readFileSync(resolve(process.argv[checkIndex + 1]), "utf8");
  if (other !== text) {
    console.error("generator manifest differs from", process.argv[checkIndex + 1]);
    process.exit(1);
  }
  console.log("generator manifest identical:", sha(text).slice(0, 16));
}
else {
  writeFileSync(OUT, text);
  console.log(`Built ${rel(OUT)}: ${Object.keys(generators).length} generators, engine ${engineHash}, manifest ${sha(text).slice(0, 16)}`);
}
