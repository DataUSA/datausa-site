/**
 * "Recent popular reports" for the home page, from Google Analytics 4 (legacy `api/homeRoute.js`).
 *
 * Talks to the GA4 Data API over REST with a service-account JWT signed by node:crypto, so no SDK is
 * needed. Configure with `GA_KEYFILE` (path to the service-account JSON) and optionally
 * `GA_PROPERTY_ID`. Without a key file, or on any error, it returns [] and the home page falls back
 * to its curated lists. Results are cached by the caller.
 */
import {readFile} from "node:fs/promises";
import {createSign} from "node:crypto";

const PROPERTY_ID = process.env.GA_PROPERTY_ID ?? "402781720";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

interface ServiceAccount {client_email: string; private_key: string; token_uri?: string}

let keyPromise: Promise<ServiceAccount | null> | undefined;
let token: {value: string; expires: number} | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function serviceAccount(): Promise<ServiceAccount | null> {
  if (!process.env.GA_KEYFILE) return null;
  keyPromise ??= readFile(process.env.GA_KEYFILE, "utf8").then(JSON.parse).catch(() => null);
  return keyPromise;
}

async function accessToken(): Promise<string | null> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const account = await serviceAccount();
  if (!account) return null;
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = account.token_uri ?? "https://oauth2.googleapis.com/token";
  const header = base64url(JSON.stringify({alg: "RS256", typ: "JWT"}));
  const claims = base64url(JSON.stringify({iss: account.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600}));
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(account.private_key);
  const assertion = `${header}.${claims}.${base64url(signature)}`;
  const response = await fetch(tokenUri, {
    method: "POST",
    headers: {"content-type": "application/x-www-form-urlencoded"},
    body: new URLSearchParams({grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion})
  });
  if (!response.ok) return null;
  const body = await response.json() as {access_token: string; expires_in: number};
  token = {value: body.access_token, expires: Date.now() + body.expires_in * 1000};
  return token.value;
}

/** Most viewed report slugs of a profile over the last `daysAgo` days, most popular first. */
export async function popularReportSlugs(profileSlug: string, daysAgo: number, limit: number): Promise<string[]> {
  try {
    const bearer = await accessToken();
    if (!bearer) return [];
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, {
      method: "POST",
      headers: {authorization: `Bearer ${bearer}`, "content-type": "application/json"},
      body: JSON.stringify({
        dateRanges: [{startDate: `${daysAgo}daysAgo`, endDate: "yesterday"}],
        metrics: [{name: "screenPageViews"}],
        dimensions: [{name: "pagePath"}],
        dimensionFilter: {filter: {fieldName: "pagePath", stringFilter: {matchType: "FULL_REGEXP", value: `/profile/(${profileSlug})/.*`}}},
        orderBys: [{metric: {metricName: "screenPageViews"}, desc: true}],
        limit
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return [];
    const body = await response.json() as {rows?: {dimensionValues: {value: string}[]}[]};
    return (body.rows ?? [])
      .map(row => row.dimensionValues[0]?.value.split("/")[3]?.split("?")[0] ?? "")
      .filter(Boolean);
  }
  catch {
    return [];
  }
}
