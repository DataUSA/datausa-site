/**
 * Names of geographies by id, for maps drawn from topojson alone: the shape files carry ids only,
 * so a map that wants to name the shape under the cursor joins this to its paths (the About maps).
 * `ids` lists exact ids; `prefix` lists id prefixes ("16000US25" is every place in Massachusetts).
 */
import {NextResponse} from "next/server";
import {getGeographyNames} from "@/lib/dimensions/db";

const TOKEN = /^\d{5}US[0-9A-Za-z]{0,12}$/;
const MAX_TOKENS = 100;

function tokens(value: string | null): string[] | null {
  if (!value) return [];
  const list = value.split(",").filter(Boolean);
  return list.length <= MAX_TOKENS && list.every(d => TOKEN.test(d)) ? list : null;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const ids = tokens(searchParams.get("ids"));
  const prefixes = tokens(searchParams.get("prefix"));
  if (!ids || !prefixes || ids.length + prefixes.length === 0) {
    return NextResponse.json({error: "Expected `ids` and/or `prefix`: comma-separated geography ids"}, {status: 400});
  }
  return NextResponse.json({data: getGeographyNames(ids, prefixes)}, {
    headers: {"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"}
  });
}
