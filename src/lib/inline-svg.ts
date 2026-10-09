import {readFileSync} from "node:fs";
import {join} from "node:path";

const cache = new Map<string, string>();
/** Larger files (usually SVGs wrapping a raster image) are referenced, not inlined, to keep the HTML small. */
const MAX_INLINE_BYTES = 20_000;

/**
 * Markup of an SVG from `public/`, ready to inline into server-rendered HTML so CSS can recolour
 * its paths (`path[fill]`, `path[stroke]`) as the legacy site did with react-inlinesvg. Returns ""
 * when the file is missing or too large (callers fall back to an `<img>`). Server only.
 */
export function inlineSvgMarkup(src: string, {className, width, height}: {className?: string; width?: number | string; height?: number | string} = {}): string {
  let markup = cache.get(src);
  if (markup === undefined) {
    try {
      const raw = readFileSync(join(process.cwd(), "public", decodeURIComponent(src)), "utf8");
      markup = raw.length > MAX_INLINE_BYTES ? "" : raw.replace(/<\?xml[^>]*>/, "").replace(/<!DOCTYPE[^>]*>/i, "").trim();
    }
    catch {
      markup = "";
    }
    cache.set(src, markup);
  }
  if (!markup) return "";
  return markup.replace(/<svg\b([^>]*)>/, (_m, attrs: string) => {
    let a = attrs.replace(/\s(width|height)="[^"]*"/g, "");
    if (width !== undefined) a += ` width="${width}"`;
    if (height !== undefined) a += ` height="${height}"`;
    if (className) a = /\sclass="/.test(a) ? a.replace(/\sclass="([^"]*)"/, ` class="$1 ${className}"`) : `${a} class="${className}"`;
    return `<svg${a} role="img" aria-hidden="true" focusable="false">`;
  });
}

/**
 * The same icon as a `<symbol>` for an SVG sprite, with its fixed fills and strokes replaced by
 * `currentColor` so one definition can be reused in any colour via `<use href="#id">` and CSS
 * `color`. Keeps pages with hundreds of icon instances small.
 */
export function svgSymbolMarkup(src: string, id: string): string {
  const markup = inlineSvgMarkup(src);
  if (!markup) return "";
  const open = markup.match(/<svg\b([^>]*)>/);
  if (!open) return "";
  const viewBox = open[1].match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 20 20";
  const inner = markup.slice(open[0].length).replace(/<\/svg>\s*$/, "")
    .replace(/\b(fill|stroke)="(?!none|transparent)[^"]*"/g, '$1="currentColor"');
  return `<symbol id="${id}" viewBox="${viewBox}">${inner}</symbol>`;
}
