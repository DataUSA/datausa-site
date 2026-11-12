"use client";

import {useEffect} from "react";

/** How long the target is kept in place while the content above it settles. */
const SETTLE_MS = 4000;
/** Any of these means the reader is moving the page themselves. */
const USER_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

/**
 * Scrolls to the URL's `#hash` once the report has rendered. The report streams in behind a
 * skeleton, so neither the browser (hard load) nor Next's `<Link>` (client navigation) finds the
 * target when they try: Next drops a hash whose element is missing at commit, and the browser
 * scrolls wherever the partial page puts it. Content that grows above the target afterwards
 * (images, charts) would push it down again, so it is re-pinned until the page settles or the
 * reader scrolls on their own.
 */
export function HashScroll({rootId}: {rootId: string}) {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const root = document.getElementById(rootId);
    if (!id || !root) return;
    const target = () => document.getElementById(id);
    if (!target()) return;

    let done = false;
    const pin = () => {
      const el = target();
      if (!done && el) el.scrollIntoView({block: "start"}); // honours the target's scroll-margin-top
    };
    const stop = () => {
      done = true;
      observer?.disconnect();
      clearTimeout(timer);
      for (const type of USER_EVENTS) window.removeEventListener(type, stop);
    };

    for (const type of USER_EVENTS) window.addEventListener(type, stop, {passive: true});
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(pin);
    observer?.observe(root);
    const timer = setTimeout(stop, SETTLE_MS);
    pin();
    return stop;
  }, [rootId]);
  return null;
}
