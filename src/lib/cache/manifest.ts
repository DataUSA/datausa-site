/**
 * The generator manifest written at build time by `scripts/cache/build-manifest.ts`
 * (`data/generator-manifest.json`, next to the dimensions database): the version of each generator,
 * of the member attributes of each template and of the lookup tables. Versions are hashes of source
 * text and data, never of the build, so entries written by one build are read by the next one when
 * nothing they depend on changed.
 *
 * Without the file the shared cache is off (logged once): a missing version must never be guessed.
 */
import {readFileSync} from "node:fs";
import {join, resolve} from "node:path";

export interface GeneratorManifest {
  format: number;
  engine: string;
  dimensions: string;
  legacy: string;
  lookups: string;
  attributes: Record<string, string>;
  generators: Record<string, string>;
}

const store = globalThis as typeof globalThis & {__generatorManifestV1?: {manifest: GeneratorManifest | null}};

function manifestPath(): string {
  const override = process.env.GENERATOR_MANIFEST_PATH;
  return override ? resolve(/* turbopackIgnore: true */ override) : join(process.cwd(), "data", "generator-manifest.json");
}

/** The manifest, read once per process; null when it is missing or unreadable. */
export function generatorManifest(): GeneratorManifest | null {
  if (store.__generatorManifestV1 && process.env.NODE_ENV === "production") return store.__generatorManifestV1.manifest;
  let manifest: GeneratorManifest | null = null;
  try {
    manifest = JSON.parse(readFileSync(manifestPath(), "utf8")) as GeneratorManifest;
    if (manifest.format !== 1) throw new Error(`unknown format ${manifest.format}`);
  }
  catch (error) {
    if (!store.__generatorManifestV1) console.warn(`[gen-cache] no generator manifest (${(error as Error).message}); run \`npm run build:manifest\`. The shared cache is off.`);
    manifest = null;
  }
  store.__generatorManifestV1 = {manifest};
  return manifest;
}
