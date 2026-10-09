/**
 * Weekly unemployment-insurance claims by state (legacy `GET /api/covid19/employment/:level`),
 * still used by the "Unemployment Insurance Claims" chart. The data is a public Google Sheet
 * published as CSV by the DOL; it is fetched server-side and cached like other data sources.
 */
import {cacheLife, cacheTag} from "next/cache";
import {NextResponse} from "next/server";

const SHEET = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_x8FhDzveu6Q6uLlxxj7d69GmaliZyKUQf9nnYmoKOHqhHE_wcxykG68Gll5JBQ9F7pnr1jDu_oVP/pub";
const SOURCES = {
  all: `${SHEET}?gid=134214696&single=true&output=csv`,
  latest: `${SHEET}?gid=618839723&single=true&output=csv`
};

function csvToJson(text: string): Record<string, string | number>[] {
  const rows = text.split(/\r?\n/).filter(Boolean).map(line => line.split(","));
  const header = rows[0] ?? [];
  return rows.slice(1).map(cells => {
    const item: Record<string, string | number> = {};
    header.forEach((h, i) => {
      const value = cells[i] ?? "";
      item[h] = value !== "" && Number.isFinite(Number(value)) ? Number(value) : value;
    });
    return item;
  });
}

async function loadClaims(level: "all" | "latest") {
  "use cache";
  cacheTag("external-data");
  cacheLife("data");
  const res = await fetch(SOURCES[level], {cache: "no-store"});
  if (!res.ok) throw new Error(`DOL claims sheet responded ${res.status}`);
  return csvToJson(await res.text());
}

export async function GET(_request: Request, {params}: {params: Promise<{level: string}>}) {
  const {level} = await params;
  try {
    const data = await loadClaims(level === "all" ? "all" : "latest");
    return NextResponse.json({
      data,
      source: [{
        annotations: {
          dataset_link: `${SHEET}?output=csv`,
          dataset_name: "Unemployment insurance weekly claims by state",
          source_link: "https://oui.doleta.gov/unemploy/claims.asp",
          source_name: "DOL Unemployment Insurance Weekly Claims Data"
        }
      }]
    }, {headers: {"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"}});
  }
  catch (error) {
    return NextResponse.json({data: [], error: (error as Error).message}, {status: 502});
  }
}
