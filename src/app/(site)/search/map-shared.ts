"use client";

import {useEffect, useRef, useState, type RefObject} from "react";

/** What the search page's maps share: the palette of the dark page and the size of their figure. */

// A sequential scale for the dark page: low values recede into the background, high ones glow.
export const SCALE = ["#22335c", "#35508f", "#5571c4", "#879bf5", "#c8d2ff"];
export const NO_DATA = "#16233f";
export const PAGE = "#00112C";
export const TEXT = "#a5abb6";
export const OUTLINE = "#33456f";

/** Lower bounds of five classes holding the same number of values each. */
export function quintiles(numbers: (number | null | undefined)[]): number[] {
  const values = numbers.filter((v): v is number => typeof v === "number").sort((a, b) => a - b);
  if (values.length < SCALE.length) return values;
  return SCALE.map((_, i) => values[Math.floor(i * values.length / SCALE.length)]);
}

export const escapeHtml = (text: string) => String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

export interface FigureSize {width: number; height: number}

/**
 * The pixel size of a map's figure, measured again 150ms after it stops changing. It stays null
 * while the figure is hidden (the maps are, on narrow screens), so nothing is loaded or drawn then.
 */
export function useFigureSize(): [RefObject<HTMLDivElement | null>, FigureSize | null] {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<FigureSize | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = {width: Math.round(rect.width), height: Math.round(rect.height)};
      if (next.width > 0 && next.height > 0) setSize(prev => prev && prev.width === next.width && prev.height === next.height ? prev : next);
    };
    measure();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => { clearTimeout(timer); timer = setTimeout(measure, 150); });
    observer.observe(el);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);
  return [ref, size];
}
