/**
 * Current senators/representatives for a geography (legacy `GET /api/civic/:type/:geo`). Still
 * requested from the browser by the House of Representatives chart.
 */
import {NextResponse} from "next/server";
import {civicOfficials, type CivicType} from "@/content/reports/geo/civic";

export async function GET(_request: Request, {params}: {params: Promise<{type: string; geo: string}>}) {
  const {type, geo} = await params;
  if (type !== "senator" && type !== "representative") return NextResponse.json({error: "Unknown type"}, {status: 404});
  const rows = await civicOfficials(type as CivicType, geo);
  return NextResponse.json(rows, {headers: {"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"}});
}
