import type {ReactElement} from "react";
import {ImageResponse} from "next/og";
import {ogFonts} from "./assets";
import {OG_SIZE} from "./theme";

/**
 * Share images change only when the underlying data does: browsers keep one for an hour, the
 * Nginx and Cloudflare caches for a day and may serve it stale for a week while refreshing.
 */
export const OG_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

async function png(element: ReactElement): Promise<ArrayBuffer> {
  return new ImageResponse(element, {...OG_SIZE, fonts: await ogFonts()}).arrayBuffer();
}

/**
 * Re-encodes a card that carries a photograph as JPEG. `ImageResponse` only writes PNG, which is
 * about 1 MB for a photo-backed card: more than some messaging apps will fetch for a link preview.
 * The JPEG is around a tenth of that. `sharp` is not a dependency of this project; it is installed
 * with Next.js (its optional dependency, used for image optimisation), so it is loaded if present
 * and the PNG is served when it is not.
 */
async function jpeg(image: ArrayBuffer): Promise<Buffer | null> {
  try {
    const {default: sharp} = await import("sharp");
    return await sharp(Buffer.from(image)).jpeg({quality: 84, chromaSubsampling: "4:4:4", mozjpeg: true}).toBuffer();
  }
  catch {
    return null;
  }
}

export interface OgImageOptions {
  /** The card includes a photograph: serve it as JPEG. Flat-colour cards stay PNG (smaller and sharper). */
  photo?: boolean;
  /** Drawn instead when the card cannot be rendered (a photo Satori cannot decode). */
  fallback?: ReactElement;
}

/** Renders a card layout to a 1200 × 630 image response. */
export async function ogImage(element: ReactElement, {photo = false, fallback}: OgImageOptions = {}): Promise<Response> {
  let image: ArrayBuffer;
  let photographic = photo;
  try {
    image = await png(element);
  }
  catch (error) {
    if (!fallback) throw error;
    console.error(`og image: ${(error as Error).message}; drawing the fallback card`);
    image = await png(fallback);
    photographic = false;
  }
  const encoded = photographic ? await jpeg(image) : null;
  return new Response(encoded ? new Uint8Array(encoded) : image, {
    headers: {"Content-Type": encoded ? "image/jpeg" : "image/png", "Cache-Control": OG_CACHE_CONTROL}
  });
}
