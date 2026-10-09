import {inlineSvgMarkup} from "@/lib/inline-svg";

/** Inlines an SVG from `public/` (see `inlineSvgMarkup`); falls back to an `<img>`. Server component. */
export function InlineSvg({src, className, width, height}: {src: string; className?: string; width?: number | string; height?: number | string}) {
  const markup = inlineSvgMarkup(src, {className, width, height});
  if (!markup) return <img src={src} alt="" className={className} width={width} height={height} />;
  return <span className="inline-svg" dangerouslySetInnerHTML={{__html: markup}} />;
}
