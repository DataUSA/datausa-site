/**
 * Builds `data/dimensions.sqlite` from the versioned `data/*.jsonl` exports. Runs as part of
 * `npm run build` (and can be re-run on a server at any time) and needs no database access.
 *
 *   npm run build:dimensions
 */
import {readFileSync, mkdirSync, rmSync, existsSync, renameSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {DatabaseSync} from "node:sqlite";

interface MemberLine {
  id: string; dimension: string; hierarchy: string; slug: string; name: string; zvalue: number | null;
  imageId: number | null; cubeName: string; keywords?: string[]; hidden?: boolean;
}

function readJsonl<T>(path: string): T[] {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line) as T);
}

export function buildDimensionsDb(dataDir = resolve("data"), target = process.env.DIMENSIONS_DB_PATH ? resolve(process.env.DIMENSIONS_DB_PATH) : resolve(dataDir, "dimensions.sqlite")) {
  // `members-additions.jsonl` holds members Tesseract has but the legacy search table never listed
  // (kept apart so a re-export does not drop them). It is read first: an exported row with the same
  // key replaces it.
  const additions = resolve(dataDir, "members-additions.jsonl");
  const members = (existsSync(additions) ? readJsonl<MemberLine>(additions) : []).concat(readJsonl<MemberLine>(resolve(dataDir, "members.jsonl")));
  const images = readJsonl<{id: number; url: string; author: string; license: number; meta?: string}>(resolve(dataDir, "images.jsonl"));
  const profiles = JSON.parse(readFileSync(resolve(dataDir, "profiles.json"), "utf8")) as {
    id: number; profileId: number; slug: string; dimension: string; levels: string[]; measure: string; cubeName: string; ordering: number; visible: boolean;
  }[];

  mkdirSync(dirname(target), {recursive: true});
  const tmp = `${target}.tmp`;
  if (existsSync(tmp)) rmSync(tmp);
  const db = new DatabaseSync(tmp);
  db.exec(`
    PRAGMA journal_mode = OFF;
    PRAGMA synchronous = OFF;
    CREATE TABLE members (
      id TEXT NOT NULL,
      dimension TEXT NOT NULL,
      hierarchy TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      zvalue REAL,
      image_id INTEGER,
      cube_name TEXT NOT NULL,
      keywords TEXT,
      hidden INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (id, dimension, hierarchy, cube_name)
    );
    CREATE INDEX members_slug ON members (dimension, slug);
    CREATE INDEX members_dim_hier_z ON members (dimension, hierarchy, zvalue DESC);
    CREATE INDEX members_image ON members (image_id);
    CREATE VIRTUAL TABLE members_fts USING fts5(name, keywords, content='members', content_rowid='rowid', tokenize='unicode61 remove_diacritics 2');
    CREATE TABLE images (id INTEGER PRIMARY KEY, url TEXT, author TEXT, license INTEGER, meta TEXT);
    CREATE TABLE profiles (id INTEGER PRIMARY KEY, profile_id INTEGER, slug TEXT, dimension TEXT, levels TEXT, measure TEXT, cube_name TEXT, ordering INTEGER, visible INTEGER);
  `);

  const insertMember = db.prepare("INSERT OR REPLACE INTO members (id, dimension, hierarchy, slug, name, zvalue, image_id, cube_name, keywords, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
  db.exec("BEGIN");
  for (const m of members) {
    insertMember.run(m.id, m.dimension, m.hierarchy, m.slug ?? m.id, m.name ?? "", m.zvalue, m.imageId, m.cubeName, m.keywords ? m.keywords.join(" ") : null, m.hidden ? 1 : 0);
  }
  const insertImage = db.prepare("INSERT OR REPLACE INTO images (id, url, author, license, meta) VALUES (?, ?, ?, ?, ?)");
  for (const i of images) insertImage.run(i.id, i.url, i.author, i.license, i.meta ?? null);
  const insertProfile = db.prepare("INSERT OR REPLACE INTO profiles (id, profile_id, slug, dimension, levels, measure, cube_name, ordering, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
  for (const p of profiles) insertProfile.run(p.id, p.profileId, p.slug, p.dimension, JSON.stringify(p.levels), p.measure, p.cubeName, p.ordering, p.visible ? 1 : 0);
  db.exec("COMMIT");
  db.exec("INSERT INTO members_fts(members_fts) VALUES ('rebuild')");
  db.exec("ANALYZE");
  db.close();
  if (existsSync(target)) rmSync(target);
  renameSync(tmp, target);
  return {target, members: members.length, images: images.length, profiles: profiles.length};
}

if (process.argv[1] && /build-dimensions/.test(process.argv[1])) {
  const result = buildDimensionsDb();
  console.log(`Built ${result.target}: ${result.members} members, ${result.images} images, ${result.profiles} profiles`);
}
