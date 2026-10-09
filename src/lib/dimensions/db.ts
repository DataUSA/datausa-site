/**
 * Read-only access to the dimensions database (`data/dimensions.sqlite`, built from the versioned
 * `data/*.jsonl` exports by `npm run build:dimensions`). This replaces the legacy CMS `canon_cms_search`
 * and `canon_cms_image` tables and the boot-time lunr index: slug resolution, site search, image
 * lookup and member metadata all come from here, synchronously and without any network or warm-up.
 */
import {DatabaseSync, type StatementSync} from "node:sqlite";
import {existsSync} from "node:fs";
import {join, resolve} from "node:path";
import type {MemberAttributes} from "@/lib/reports/types";

export interface MemberRow extends MemberAttributes {
  hidden: boolean;
  keywords: string[];
}

export interface ProfileRow {
  id: number;
  profileId: number;
  slug: string;
  dimension: string;
  levels: string[];
  measure: string;
  cubeName: string;
  ordering: number;
  visible: boolean;
}

export interface ImageRow {
  id: number;
  url: string | null;
  author: string | null;
  license: number | null;
  meta: string | null;
}

let db: DatabaseSync | null = null;
const statements = new Map<string, StatementSync>();

function dbPath(): string {
  const override = process.env.DIMENSIONS_DB_PATH;
  // The override is a deployment setting; keep the default statically scoped so the bundler's file
  // tracing includes only the data folder.
  return override ? resolve(/* turbopackIgnore: true */ override) : join(process.cwd(), "data", "dimensions.sqlite");
}

function connection(): DatabaseSync {
  if (!db) {
    const path = dbPath();
    if (!existsSync(path)) {
      throw new Error(`Dimensions database not found at ${path}. Run \`npm run build:dimensions\` (DIMENSIONS_DB_PATH overrides the location).`);
    }
    db = new DatabaseSync(path, {readOnly: true});
  }
  return db;
}

function prepare(sql: string): StatementSync {
  let stmt = statements.get(sql);
  if (!stmt) {
    stmt = connection().prepare(sql);
    statements.set(sql, stmt);
  }
  return stmt;
}

type Raw = Record<string, unknown>;

function toMember(row: Raw): MemberRow {
  return {
    id: String(row.id),
    dimension: String(row.dimension),
    hierarchy: String(row.hierarchy),
    slug: String(row.slug),
    name: String(row.name ?? ""),
    cubeName: String(row.cube_name),
    imageId: row.image_id === null || row.image_id === undefined ? null : Number(row.image_id),
    zvalue: row.zvalue === null || row.zvalue === undefined ? null : Number(row.zvalue),
    hidden: Boolean(row.hidden),
    keywords: typeof row.keywords === "string" && row.keywords ? row.keywords.split(" ") : []
  };
}

const MEMBER_COLUMNS = "id, dimension, hierarchy, slug, name, zvalue, image_id, cube_name, keywords, hidden";

/** All profile types (report families) known to the dimensions database, in display order. */
export function getProfiles(): ProfileRow[] {
  const rows = prepare("SELECT id, profile_id, slug, dimension, levels, measure, cube_name, ordering, visible FROM profiles ORDER BY ordering, id").all() as Raw[];
  return rows.map(r => ({
    id: Number(r.id),
    profileId: Number(r.profile_id),
    slug: String(r.slug),
    dimension: String(r.dimension),
    levels: JSON.parse(String(r.levels ?? "[]")) as string[],
    measure: String(r.measure ?? ""),
    cubeName: String(r.cube_name ?? ""),
    ordering: Number(r.ordering ?? 0),
    visible: Boolean(r.visible)
  }));
}

export function getProfile(slug: string): ProfileRow | undefined {
  return getProfiles().find(p => p.slug === slug && p.ordering === 0);
}

/**
 * Resolves a URL member identifier (slug such as `massachusetts` or raw id such as `04000US25`)
 * for a profile. Slugs win over ids, as in Canon. Hidden members (`show: false`) are not resolved.
 */
export function resolveMember(profile: ProfileRow, idOrSlug: string): MemberRow | undefined {
  const bySlug = prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND cube_name = ? AND slug = ? LIMIT 1`).get(profile.dimension, profile.cubeName, idOrSlug) as Raw | undefined;
  if (bySlug) {
    const m = toMember(bySlug);
    if (!m.hidden && (!profile.levels.length || profile.levels.includes(m.hierarchy))) return m;
  }
  const byId = prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND cube_name = ? AND id = ? LIMIT 1`).get(profile.dimension, profile.cubeName, idOrSlug) as Raw | undefined;
  if (byId) {
    const m = toMember(byId);
    if (!m.hidden && (!profile.levels.length || profile.levels.includes(m.hierarchy))) return m;
  }
  return undefined;
}

export function getMember(dimension: string, id: string, cubeName?: string): MemberRow | undefined {
  const row = cubeName
    ? prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND id = ? AND cube_name = ? LIMIT 1`).get(dimension, id, cubeName) as Raw | undefined
    : prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND id = ? LIMIT 1`).get(dimension, id) as Raw | undefined;
  return row ? toMember(row) : undefined;
}

/** Fetches many members by id, preserving the order of `ids`; unknown ids are skipped. */
export function getMembers(dimension: string, ids: string[], hierarchy?: string): MemberRow[] {
  if (!ids.length) return [];
  const out: MemberRow[] = [];
  const stmt = hierarchy
    ? prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND id = ? AND hierarchy = ? LIMIT 1`)
    : prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND id = ? LIMIT 1`);
  for (const id of ids) {
    const row = (hierarchy ? stmt.get(dimension, id, hierarchy) : stmt.get(dimension, id)) as Raw | undefined;
    if (row) out.push(toMember(row));
  }
  return out;
}

/** Members of a dimension/hierarchy ordered by popularity (zvalue), e.g. all states. */
export function listMembers(dimension: string, hierarchy: string, limit = 100, includeHidden = false): MemberRow[] {
  const rows = prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND hierarchy = ? ${includeHidden ? "" : "AND hidden = 0"} ORDER BY zvalue DESC LIMIT ?`).all(dimension, hierarchy, limit) as Raw[];
  return rows.map(toMember);
}

export function getImage(id: number): ImageRow | undefined {
  const row = prepare("SELECT id, url, author, license, meta FROM images WHERE id = ?").get(id) as Raw | undefined;
  return row ? {id: Number(row.id), url: (row.url as string) ?? null, author: (row.author as string) ?? null, license: row.license === null ? null : Number(row.license), meta: (row.meta as string) ?? null} : undefined;
}

export interface SearchOptions {
  dimension?: string;
  hierarchy?: string;
  limit?: number;
}

export interface SearchResult extends MemberRow {
  score: number;
}

/** Sanitises a search query the way the legacy site did (lowercase, strip punctuation). */
export function sanitizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9\s\-]/g, " ").replace(/\s+/g, " ").trim();
}

const ABBREVIATIONS: [string, string][] = [["ft", "fort"], ["jct", "junction"], ["mdw", "meadow"], ["mt", "mount"], ["mtn", "mountain"], ["pt", "point"], ["st", "saint"]];

/**
 * Sitewide search over member names and keywords (FTS5 prefix matching), re-ranked with the legacy
 * heuristics: exact name/keyword match first, then prefix matches, weighted by popularity (zvalue).
 */
export function searchMembers(query: string, {dimension, hierarchy, limit = 10}: SearchOptions = {}): SearchResult[] {
  const q = sanitizeQuery(query);
  if (!q) {
    const rows = prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE hidden = 0 ${dimension ? "AND dimension = ?" : ""} ${hierarchy ? "AND hierarchy = ?" : ""} ORDER BY zvalue DESC LIMIT ?`)
      .all(...[dimension, hierarchy].filter((x): x is string => Boolean(x)), limit) as Raw[];
    return rows.map(r => ({...toMember(r), score: 0}));
  }
  const terms = q.split(" ").filter(Boolean);
  // expand abbreviations both ways so "st louis" finds "Saint Louis" and vice versa
  const expanded = terms.map(t => {
    const abbr = ABBREVIATIONS.find(([a, b]) => a === t || b === t);
    return abbr ? `(${abbr[0]}* OR ${abbr[1]}*)` : `${t.replace(/"/g, "")}*`;
  });
  const match = expanded.join(" ");
  const where = [dimension ? "m.dimension = ?" : "", hierarchy ? "m.hierarchy = ?" : ""].filter(Boolean).join(" AND ");
  const sql = `SELECT ${MEMBER_COLUMNS.split(", ").map(c => `m.${c}`).join(", ")}, bm25(members_fts) AS rank
    FROM members_fts f JOIN members m ON m.rowid = f.rowid
    WHERE members_fts MATCH ? AND m.hidden = 0 ${where ? `AND ${where}` : ""}
    ORDER BY rank LIMIT ?`;
  const candidateLimit = Math.max(limit * 10, 100);
  let rows: Raw[];
  try {
    rows = prepare(sql).all(match, ...[dimension, hierarchy].filter((x): x is string => Boolean(x)), candidateLimit) as Raw[];
  }
  catch {
    return [];
  }
  const scored = rows.map(r => {
    const m = toMember(r);
    const name = sanitizeQuery(m.name);
    const base = -Number(r.rank); // bm25 is negative; higher is better
    let score = base;
    const diffMod = q.length / Math.max(name.length, 1);
    if (name === q || m.keywords.includes(q)) score = 1000000;
    else if (name.startsWith(q)) score *= 20 * diffMod;
    else if (q.startsWith(name.slice(0, 10))) score *= 10 * diffMod;
    else if (q.startsWith(name.slice(0, 5))) score *= 5 * diffMod;
    const zscore = (m.zvalue ?? 0) * 0.15;
    return {...m, score: score * 7.5 + zscore * 3.1};
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Visible member slugs of a profile in stable order, for sitemaps (page of `limit` from `offset`). */
export function listMemberSlugs(profile: ProfileRow, limit: number, offset: number): {rows: {slug: string; zvalue: number | null}[]; total: number} {
  const levelsSql = profile.levels.length ? `AND hierarchy IN (${profile.levels.map(() => "?").join(", ")})` : "";
  const args = [profile.dimension, profile.cubeName, ...profile.levels];
  const total = Number((prepare(`SELECT COUNT(*) AS n FROM members WHERE dimension = ? AND cube_name = ? AND hidden = 0 ${levelsSql}`).get(...args) as Raw).n);
  if (!limit) return {rows: [], total};
  const rows = prepare(`SELECT slug, zvalue FROM members WHERE dimension = ? AND cube_name = ? AND hidden = 0 ${levelsSql} ORDER BY zvalue DESC, id LIMIT ? OFFSET ?`).all(...args, limit, offset) as Raw[];
  return {rows: rows.map(r => ({slug: String(r.slug), zvalue: r.zvalue === null ? null : Number(r.zvalue)})), total};
}

/** Counts of visible members per dimension (legacy `/api/search/totals`). */
export function memberTotals(): Record<string, number> {
  const rows = prepare("SELECT dimension, COUNT(*) AS n FROM members WHERE hidden = 0 GROUP BY dimension").all() as Raw[];
  return Object.fromEntries(rows.map(r => [String(r.dimension), Number(r.n)]));
}

/** Counts of visible members per dimension and hierarchy (legacy `/api/search/totals`). */
export function memberTotalsByHierarchy(): Record<string, Record<string, number>> {
  const rows = prepare("SELECT dimension, hierarchy, COUNT(*) AS n FROM members WHERE hidden = 0 GROUP BY dimension, hierarchy").all() as Raw[];
  const out: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    const dim = String(r.dimension);
    (out[dim] ??= {})[String(r.hierarchy)] = Number(r.n);
  }
  return out;
}

/** Fetches members by slug or id (either works, as in report URLs), preserving the order of `keys`. */
export function getMembersBySlugOrId(dimension: string, keys: string[]): MemberRow[] {
  if (!keys.length) return [];
  const stmt = prepare(`SELECT ${MEMBER_COLUMNS} FROM members WHERE dimension = ? AND (slug = ? OR id = ?) AND hidden = 0 ORDER BY zvalue DESC LIMIT 1`);
  const out: MemberRow[] = [];
  for (const key of keys) {
    const row = stmt.get(dimension, key, key) as Raw | undefined;
    if (row) out.push(toMember(row));
  }
  return out;
}
