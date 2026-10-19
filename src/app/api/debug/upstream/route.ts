/**
 * Load-testing diagnostics: the upstream request slots of the worker that answers
 * (`src/lib/api/limit.ts`): per host, requests in flight and waiting now, and since the worker
 * started how many were sent, how many waited (and the longest wait) and how many were dropped.
 * Each PM2 worker keeps its own counters. Disabled in production unless ENABLE_DEBUG_ROUTES=true.
 */
import {connection, NextResponse} from "next/server";
import {upstreamStats} from "@/lib/api/limit";

export async function GET() {
  await connection(); // always computed per request, never prerendered
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEBUG_ROUTES !== "true") {
    return NextResponse.json({error: "disabled"}, {status: 404});
  }
  return NextResponse.json(upstreamStats(), {headers: {"Cache-Control": "no-store"}});
}
