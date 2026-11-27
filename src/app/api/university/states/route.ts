/**
 * Universities per state, for the search page's state map and menu: how many have a report and
 * their total enrollment in the latest IPEDS year.
 */
import {connection, NextResponse} from "next/server";
import {getUniversityFigures} from "@/lib/dimensions/universities";

export async function GET() {
  await connection(); // computed per request (the lookup is shared and kept in memory), never prerendered
  const figures = await getUniversityFigures();
  const states = Array.from(figures.states.values()).sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({year: figures.years.enrollment, states}, {
    headers: {"Cache-Control": states.length ? "public, max-age=3600, stale-while-revalidate=86400" : "no-store"}
  });
}
