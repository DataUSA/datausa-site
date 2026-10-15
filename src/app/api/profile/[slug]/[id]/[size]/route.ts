/**
 * A report's photo (legacy `GET /api/profile/:pslug/:pid/:size`): `splash` (hero) or `thumb`
 * (tiles) as a JPEG, or `json` for its credit. The member is a slug or an id; one without a photo
 * gets its nearest parent's, and an unknown one the family's stock photo, as on the legacy site.
 */
import {NextResponse} from "next/server";
import {getImage, getMember, getProfile, resolveMember} from "@/lib/dimensions/db";
import {defaultImageId, pictureId, readImage} from "@/lib/reports/images";

export async function GET(_request: Request, {params}: {params: Promise<{slug: string; id: string; size: string}>}) {
  const {slug, id, size} = await params;
  if (size !== "splash" && size !== "thumb" && size !== "json") return NextResponse.json({error: "size must be splash, thumb or json"}, {status: 404});
  const profile = getProfile(slug);
  const key = decodeURIComponent(id);
  const member = profile ? resolveMember(profile, key) ?? getMember(profile.dimension, key) : undefined;
  const imageId = member ? await pictureId(slug, member) : defaultImageId(slug);
  const headers = {"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"};
  if (size === "json") return NextResponse.json(getImage(imageId) ?? null, {headers});
  const file = await readImage(size, imageId) ?? (imageId !== defaultImageId(slug) ? await readImage(size, defaultImageId(slug)) : null);
  if (!file) return NextResponse.json({error: "Image not found"}, {status: 404, headers: {"Cache-Control": "no-store"}});
  return new Response(new Uint8Array(file), {headers: {...headers, "Content-Type": "image/jpeg", "Content-Length": String(file.byteLength)}});
}
