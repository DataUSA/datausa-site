/**
 * PeoplePrism registrations are the one piece of runtime state the site writes: a row per visitor
 * who unlocks the gated health sections. Stored in the `prism_submissions` table of the Prism
 * database (`PRISM_DATABASE_URL`), unchanged from the legacy schema.
 */
import {Pool} from "pg";

let pool: Pool | null = null;

function getPool(): Pool | null {
  const url = process.env.PRISM_DATABASE_URL;
  if (!url) return null;
  if (!pool) pool = new Pool({connectionString: url, max: 4, application_name: "datausa-site"});
  return pool;
}

export interface PrismRegistration {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  company: string;
  country: string;
  state?: string;
  reason?: string;
  otherReason?: string;
  tellUsMore?: string;
  consent: boolean;
}

export const prismDbEnabled = () => Boolean(process.env.PRISM_DATABASE_URL);

/** Inserts a registration and returns its id. */
export async function createPrismSubmission(data: PrismRegistration): Promise<number> {
  const db = getPool();
  if (!db) throw new Error("PRISM_DATABASE_URL is not configured");
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const result = await db.query<{id: number}>(
    `INSERT INTO prism_submissions
       ("firstName", "lastName", email, "jobTitle", company, country, state, reason, "otherReason", "tellUsMore", consent, "expiresAt", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
     RETURNING id`,
    [data.firstName, data.lastName, data.email, data.jobTitle ?? null, data.company, data.country, data.state ?? null,
      data.reason ?? null, data.otherReason ?? null, data.tellUsMore ?? null, data.consent, expiresAt]
  );
  return result.rows[0].id;
}
