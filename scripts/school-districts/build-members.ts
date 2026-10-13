/**
 * Writes `data/school-districts.jsonl` from the attribute table of the Census boundary files
 * (called by `scripts/school-districts/build.sh`, which documents the sources).
 *
 *   npx tsx scripts/school-districts/build-members.ts <districts.json> <year>
 *
 * Names are the Census Bureau's, followed by the state's postal code like every other location
 * ("Boston School District, MA"). Where the Census name is a bare place or region ("Bar Harbor",
 * "Yellow Medicine East", "Fremont RE-1"), "School District" is appended so the member cannot be
 * mistaken for the town of the same name.
 *
 * Slugs are the name in lower case with hyphens. A slug already taken (by another location or by
 * another district) gets the id appended, as the legacy site did ("pittsburgh-pa-31000US38300"). A
 * district that is already in the file keeps its slug, so a rebuild never breaks a published URL.
 */
import {existsSync, readFileSync, writeFileSync} from "node:fs";
import {resolve} from "node:path";

interface Source {
  id: string; GEOID: string; NAME: string; STUSPS: string; LOGRADE: string; HIGRADE: string; ALAND: number | string; lon: number; lat: number;
}
interface Line {
  id: string; dimension: string; hierarchy: string; slug: string; name: string; zvalue: null; imageId: null; cubeName: string;
  lowGrade: string; highGrade: string; landSqMi: number; lonlat: [number, number];
}

const HIERARCHY = "School District";
/** The geo profile's key in the dimensions database (members are looked up by profile cube). */
const CUBE_NAME = "acs_yg_total_population_5";
const SQ_METERS_PER_SQ_MILE = 2589988.110336;
/** Census names that already say what they are ("... School District", "... Public Schools", "... CUSD 3", "... K-12"). */
const SELF_DESCRIBING = /\b(schools?|districts?|education|academy|unit|unified|(c|cu|u|uh|ch|h|i)?sd|k-12)\b/i;

const slugify = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const readJsonl = <T>(path: string): T[] => existsSync(path) ? readFileSync(path, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line) as T) : [];

const [sourcePath, year] = process.argv.slice(2);
if (!sourcePath || !year) {
  console.error("usage: build-members.ts <districts.json> <year>");
  process.exit(1);
}

const target = resolve("data", "school-districts.jsonl");
const previous = new Map(readJsonl<Line>(target).map(d => [d.id, d.slug]));
const taken = new Set<string>();
for (const file of ["members.jsonl", "members-additions.jsonl"]) {
  for (const m of readJsonl<{dimension: string; slug: string}>(resolve("data", file))) if (m.dimension === "Geography") taken.add(m.slug);
}

const sources = (JSON.parse(readFileSync(sourcePath, "utf8")) as Source[]).sort((a, b) => a.id.localeCompare(b.id));
// slugs of districts that are staying are reserved first, so a new district cannot take one over
for (const d of sources) if (previous.has(d.id)) taken.add(previous.get(d.id)!);

const lines: Line[] = sources.map(d => {
  const name = `${SELF_DESCRIBING.test(d.NAME) ? d.NAME : `${d.NAME} School District`}, ${d.STUSPS}`;
  let slug = previous.get(d.id);
  if (!slug) {
    slug = slugify(name);
    if (taken.has(slug)) slug = `${slug}-${d.id}`;
    taken.add(slug);
  }
  return {
    id: d.id, dimension: "Geography", hierarchy: HIERARCHY, slug, name, zvalue: null, imageId: null, cubeName: CUBE_NAME,
    lowGrade: d.LOGRADE, highGrade: d.HIGRADE, landSqMi: Math.round(Number(d.ALAND) / SQ_METERS_PER_SQ_MILE * 10) / 10, lonlat: [d.lon, d.lat]
  };
});

const gone = Array.from(previous.keys()).filter(id => !lines.some(d => d.id === id));
writeFileSync(target, `${lines.map(d => JSON.stringify(d)).join("\n")}\n`);
console.log(`Wrote ${target}: ${lines.length} school districts (${year} boundaries)${previous.size ? `, ${lines.filter(d => !previous.has(d.id)).length} new, ${gone.length} removed` : ""}`);
if (gone.length) console.log(`Removed ids (their URLs now 404; add redirects to src/content/shared/data/oldgeos.json where a successor exists):\n  ${gone.join("\n  ")}`);
