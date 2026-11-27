/**
 * Read-only queries on the geography tables of the dimensions database that reports and landing
 * pages use to place a location in its hierarchy: what a county or metropolitan area contains
 * (`geo_contains`), the land area and interior point of a geography (`geo_facts`), and the members
 * of a level inside one state.
 *
 * Kept apart from `db.ts` on purpose, with a connection of its own: `db.ts` is part of the engine
 * closure hashed into every generator cache key (`scripts/cache/build-manifest.ts`), so a change
 * there would re-key the whole cache. Nothing here is read by a generator.
 */
import {DatabaseSync, type StatementSync} from "node:sqlite";
import {statSync} from "node:fs";
import {join, resolve} from "node:path";

let db: DatabaseSync | null = null;
let opened = "";
let checkedAt = 0;
const statements = new Map<string, StatementSync>();
const RECHECK_MS = 5000;

/** Tables read here that an older build of the database lacks. */
const REQUIRED_TABLES = ["geo_facts", "geo_contains", "university_locations"];

function dbPath(): string {
  const override = process.env.DIMENSIONS_DB_PATH;
  return override ? resolve(/* turbopackIgnore: true */ override) : join(process.cwd(), "data", "dimensions.sqlite");
}

const fingerprint = (path: string) => {
  const stat = statSync(path);
  return `${stat.ino}:${stat.size}:${stat.mtimeMs}`;
};

/** The open database, reopened when `npm run build:dimensions` has swapped a new file in (as in `db.ts`). */
function prepare(sql: string): StatementSync {
  const path = dbPath();
  if (db && Date.now() - checkedAt > RECHECK_MS) {
    checkedAt = Date.now();
    try {
      if (fingerprint(path) !== opened) {
        statements.clear();
        db.close();
        db = null;
      }
    }
    catch {
      // mid-swap: keep the open database and look again later
    }
  }
  if (!db) {
    const opening = new DatabaseSync(path, {readOnly: true});
    // `data/dimensions.sqlite` is not in Git: a checkout can hold one built before these tables
    // existed, and reading it would quietly give empty maps and lists
    const present = new Set((opening.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as Raw[]).map(r => String(r.name)));
    const missing = REQUIRED_TABLES.filter(t => !present.has(t));
    if (missing.length) {
      opening.close();
      throw new Error(`The dimensions database at ${path} is out of date (no ${missing.join(", ")} table). Run \`npm run build:dimensions\`.`);
    }
    db = opening;
    opened = fingerprint(path);
    checkedAt = Date.now();
  }
  let stmt = statements.get(sql);
  if (!stmt) statements.set(sql, stmt = db.prepare(sql));
  return stmt;
}

type Raw = Record<string, unknown>;

/** A member as lists and links need it. */
export interface GeoMember {id: string; slug: string; name: string; hierarchy: string}

const toMember = (row: Raw): GeoMember => ({id: String(row.id), slug: String(row.slug), name: String(row.name ?? ""), hierarchy: String(row.hierarchy)});

export interface GeoFacts {
  landSqMi: number | null;
  waterSqMi: number | null;
  /** A point inside the geography, `[longitude, latitude]`. */
  lonlat: [number, number] | null;
}

/** Land area and interior point of a geography (Census gazetteer; school districts from their boundary file). */
export function geoFacts(id: string): GeoFacts | undefined {
  const row = prepare("SELECT land_sqmi, water_sqmi, lon, lat FROM geo_facts WHERE id = ?").get(id) as Raw | undefined;
  if (!row) return undefined;
  const n = (v: unknown) => v === null || v === undefined ? null : Number(v);
  const lon = n(row.lon), lat = n(row.lat);
  return {landSqMi: n(row.land_sqmi), waterSqMi: n(row.water_sqmi), lonlat: lon !== null && lat !== null ? [lon, lat] : null};
}

/** Land area in square miles of every geography of a level that has one, by id. */
export function levelLandAreas(hierarchy: string): Map<string, number> {
  const rows = prepare("SELECT f.id, f.land_sqmi FROM geo_facts f JOIN members m ON m.id = f.id AND m.dimension = 'Geography' WHERE m.hierarchy = ? AND f.land_sqmi > 0").all(hierarchy) as Raw[];
  return new Map(rows.map(r => [String(r.id), Number(r.land_sqmi)]));
}

/** Visible members of one level that a county or metropolitan area contains, in name order. */
export function containedMembers(parentId: string, level: string): GeoMember[] {
  const rows = prepare(`SELECT m.id, m.slug, m.name, m.hierarchy FROM geo_contains c
    JOIN members m ON m.id = c.child_id AND m.dimension = 'Geography' AND m.hidden = 0
    WHERE c.parent_id = ? AND c.child_level = ? ORDER BY m.name`).all(parentId, level) as Raw[];
  return rows.map(toMember);
}

/** The county and metropolitan area a place, county or school district lies in. */
export function containers(childId: string): GeoMember[] {
  const rows = prepare(`SELECT m.id, m.slug, m.name, m.hierarchy FROM geo_contains c
    JOIN members m ON m.id = c.parent_id AND m.dimension = 'Geography' AND m.hidden = 0
    WHERE c.child_id = ?`).all(childId) as Raw[];
  return rows.map(toMember);
}

/** Visible members of a level in one state (two-digit FIPS code: the id carries it after "US"), in name order. */
export function stateMembers(hierarchy: string, fips: string): GeoMember[] {
  const rows = prepare("SELECT id, slug, name, hierarchy FROM members WHERE dimension = 'Geography' AND hierarchy = ? AND hidden = 0 AND substr(id, 8, 2) = ? ORDER BY name").all(hierarchy, fips) as Raw[];
  return rows.map(toMember);
}

/** How many visible members of a level each state has, by FIPS code. */
export function stateCounts(hierarchy: string): Map<string, number> {
  const rows = prepare("SELECT substr(id, 8, 2) AS fips, COUNT(*) AS n FROM members WHERE dimension = 'Geography' AND hierarchy = ? AND hidden = 0 GROUP BY 1").all(hierarchy) as Raw[];
  return new Map(rows.map(r => [String(r.fips), Number(r.n)]));
}

/** Every visible member of a level of any dimension, in name order. */
export function levelMembers(dimension: string, hierarchy: string): GeoMember[] {
  const rows = prepare("SELECT id, slug, name, hierarchy FROM members WHERE dimension = ? AND hierarchy = ? AND hidden = 0 ORDER BY name").all(dimension, hierarchy) as Raw[];
  return rows.map(toMember);
}

export interface UniversityLocation {
  /** Longitude and latitude. */
  lonlat: [number, number];
  /** City or town of its address and the state's postal abbreviation ("Beverly, MA"). */
  place?: string;
}

/** Where each college and university is, by University id, from the IPEDS directory. */
export function universityLocations(): Map<string, UniversityLocation> {
  const rows = prepare("SELECT id, lon, lat, city, state FROM university_locations").all() as Raw[];
  return new Map(rows.map(r => [String(r.id), {
    lonlat: [Number(r.lon), Number(r.lat)] as [number, number],
    place: r.city ? `${String(r.city)}${r.state ? `, ${String(r.state)}` : ""}` : undefined
  }]));
}
