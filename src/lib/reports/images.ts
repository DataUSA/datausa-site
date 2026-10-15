/**
 * Report photos (legacy `api/profileImage.js`). The JPEGs live outside the repository in
 * `profile-images/{splash,thumb}/<image id>.jpg` (about 720 MB, copied from the legacy app's
 * `static/images/profile`), or wherever `PROFILE_IMAGES_DIR` points.
 */
import {readFile} from "node:fs/promises";
import {join, resolve} from "node:path";
import {getImage, getMembers, type MemberRow} from "@/lib/dimensions/db";
import {geoParents} from "@/lib/dimensions/parents";
import {parentLookup} from "@/lib/content/lookups";
import {imageMember} from "@/lib/reports/load";

export type ImageSize = "splash" | "thumb";

/** The stock photo of a report family without one of its own (legacy defaults). */
const DEFAULT_IMAGE = 1849;
const DEFAULT_BY_PROFILE: Record<string, number> = {university: 2032, cip: 2032};

export const defaultImageId = (profileSlug: string): number => DEFAULT_BY_PROFILE[profileSlug] ?? DEFAULT_IMAGE;

/** Folder holding `splash/` and `thumb/`. Relative paths are taken from the server's working directory. */
export function imagesDir(): string {
  // kept out of the bundler's file tracing: the photos are not copied into the build
  return resolve(/* turbopackIgnore: true */ process.env.PROFILE_IMAGES_DIR || "profile-images");
}

/**
 * The photo that illustrates a member's report: its own, else that of its nearest parent with one
 * (a county shows its state's), else the family's stock photo. Geographies take their parents from
 * the geoservice, widest first, so the list is read from the end; the other families from their
 * hierarchy, in the order Tesseract gives the ancestors, as the legacy site did.
 */
export async function pictureId(profileSlug: string, member: MemberRow): Promise<number> {
  const pictured = imageMember(member);
  if (pictured.imageId !== null && pictured.imageId !== undefined) return pictured.imageId;
  let ids: string[] = [];
  try {
    ids = pictured.dimension === "Geography"
      ? (await geoParents(pictured, true)).map(p => p.id).reverse()
      : (await parentLookup(profileSlug))[pictured.id] ?? [];
  }
  catch {
    // the geoservice or Tesseract is down: the stock photo will do
  }
  const parent = getMembers(pictured.dimension, ids).find(p => p.imageId !== null && p.imageId !== undefined);
  return parent?.imageId ?? defaultImageId(profileSlug);
}

/** Photo credit (author, link, licence) of a member's report photo. */
export async function pictureCredit(profileSlug: string, member: MemberRow) {
  return getImage(await pictureId(profileSlug, member));
}

/** The JPEG of an image, or null when the file is missing. */
export async function readImage(size: ImageSize, imageId: number): Promise<Buffer | null> {
  if (!Number.isInteger(imageId)) return null;
  try {
    return await readFile(join(imagesDir(), size, `${imageId}.jpg`));
  }
  catch {
    return null;
  }
}
