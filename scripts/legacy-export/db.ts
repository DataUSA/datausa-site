/**
 * Read-only connection to the legacy Canon CMS database for one-time extraction.
 * Credentials come from `LEGACY_CMS_DATABASE_URL` (see `.env.migration.local`, never committed).
 */
import {Client} from "pg";

export interface CmsTables {
  profile: Row[];
  profile_meta: Row[];
  profile_content: Row[];
  section: Row[];
  section_content: Row[];
  section_subtitle: Row[];
  section_subtitle_content: Row[];
  section_description: Row[];
  section_description_content: Row[];
  section_stat: Row[];
  section_stat_content: Row[];
  section_visualization: Row[];
  section_selector: Row[];
  selector: Row[];
  generator: Row[];
  materializer: Row[];
  formatter: Row[];
}

export type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function connectReadOnly(): Promise<Client> {
  const url = process.env.LEGACY_CMS_DATABASE_URL;
  if (!url) throw new Error("LEGACY_CMS_DATABASE_URL is not set (expected in .env.migration.local)");
  const client = new Client({connectionString: url, application_name: "datausa-legacy-export"});
  await client.connect();
  // Belt and braces: every statement on this session is read-only.
  await client.query("SET default_transaction_read_only = on");
  await client.query("SET statement_timeout = '120s'");
  return client;
}

const TABLES: (keyof CmsTables)[] = [
  "profile", "profile_meta", "profile_content", "section", "section_content", "section_subtitle",
  "section_subtitle_content", "section_description", "section_description_content", "section_stat",
  "section_stat_content", "section_visualization", "section_selector", "selector", "generator",
  "materializer", "formatter"
];

export async function readCmsTables(client: Client): Promise<CmsTables> {
  const out: Partial<CmsTables> = {};
  for (const table of TABLES) {
    const res = await client.query(`SELECT * FROM canon_cms_${table} ORDER BY 1`);
    out[table] = res.rows;
  }
  return out as CmsTables;
}

/** Picks the English content row for an entity, like Canon's `bubbleUp` with locale "en". */
export function contentFor(rows: Row[], id: number, locale = "en"): Row {
  const byId = rows.filter(r => r.id === id);
  return byId.find(r => r.locale === locale) ?? byId[0] ?? {};
}
