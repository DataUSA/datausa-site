/**
 * Candidate portraits for election statistics (legacy `GET /api/candidate/:type/:id`): serves the
 * bundled JPEG for the candidate id, or the generic "unknown" portrait when none exists.
 */
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {NextResponse} from "next/server";

const ROOT = join(process.cwd(), "public", "images", "candidates");

export async function GET(_request: Request, {params}: {params: Promise<{type: string; id: string}>}) {
  const {type, id} = await params;
  const safeType = type.replace(/[^a-z]/gi, "");
  const safeId = id.replace(/[^A-Za-z0-9_-]/g, "");
  let body: Buffer;
  try {
    body = await readFile(join(ROOT, safeType, `${safeId}.jpg`));
  }
  catch {
    body = await readFile(join(ROOT, "unknown.jpg"));
  }
  return new NextResponse(new Uint8Array(body), {headers: {"Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"}});
}
