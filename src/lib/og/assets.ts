/**
 * Fonts and artwork for the generated share images. Satori cannot use the site's web fonts (woff2
 * from Google Fonts), so the two brand faces ship as TTF files in `assets/og` (SIL Open Font
 * License, see the OFL files beside them). Everything is read once per process.
 */
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {PALANQUIN, PATHWAY} from "./theme";

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

const FONT_DIR = join(process.cwd(), "assets", "og");

async function font(file: string, name: string, weight: 400 | 700): Promise<OgFont> {
  const buffer = await readFile(join(FONT_DIR, file));
  return {name, weight, style: "normal", data: buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer};
}

let fonts: Promise<OgFont[]> | undefined;
export function ogFonts(): Promise<OgFont[]> {
  fonts ??= Promise.all([
    font("Palanquin-Regular.ttf", PALANQUIN, 400),
    font("Palanquin-Bold.ttf", PALANQUIN, 700),
    font("PathwayGothicOne-Regular.ttf", PATHWAY, 400)
  ]);
  return fonts;
}

/** The white wordmark (959 × 232), as a data URI. */
export const LOGO_RATIO = 959 / 232;
let logo: Promise<string> | undefined;
export function ogLogo(): Promise<string> {
  logo ??= readFile(join(process.cwd(), "public", "images", "home", "logo.png")).then(b => `data:image/png;base64,${b.toString("base64")}`);
  return logo;
}

/**
 * Downloads a member photo for embedding. Returns undefined instead of throwing: the card is drawn
 * on plain navy when the image host is slow or has no picture.
 */
/** A JPEG already in memory (a report photo read from disk) as a data URI, under the same size limits as `fetchPhoto`. */
export function photoDataUri(buffer: Buffer | null): string | undefined {
  if (!buffer || buffer.byteLength < 1024 || buffer.byteLength > 4 * 1024 * 1024) return undefined;
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

export async function fetchPhoto(url: string, timeoutMs = 4000): Promise<string | undefined> {
  try {
    const response = await fetch(url, {signal: AbortSignal.timeout(timeoutMs)});
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(jpeg|png)/.test(type)) return undefined;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength < 1024 || buffer.byteLength > 4 * 1024 * 1024) return undefined;
    return `data:${type.split(";")[0]};base64,${buffer.toString("base64")}`;
  }
  catch {
    return undefined;
  }
}
