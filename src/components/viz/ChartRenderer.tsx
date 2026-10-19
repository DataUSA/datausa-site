"use client";

import {useEffect, useRef} from "react";
import * as core from "@d3plus/core";
import {applyConfig, hash} from "@d3plus/dom";
import "@/lib/viz/d3plus-compat";
import {theme} from "@/lib/viz/theme";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const charts = core as unknown as Record<string, (new () => AnyRecord) | undefined>;

/** Whether `@d3plus/core` exports a chart class of this name (the CMS `type`). */
export function hasChart(type: string): boolean {
  return typeof charts[type] === "function";
}

interface ChartRendererProps {
  type: string;
  config: AnyRecord;
  className?: string;
  /** Called with the d3plus instance after each render (the search map reads its fitted projection and zoom). */
  onRender?: (viz: AnyRecord) => void;
}

/**
 * Mounts one d3plus chart into an `<svg>`. Replaces `@d3plus/react`'s Renderer, whose render effect
 * is not StrictMode-safe: React's simulated unmount/remount in development re-ran `render()` on the
 * same instance while its data was still loading, and two overlapping d3plus renders apply the axis
 * margins twice (half-height plots, bar labels gone). Here the render is deferred by one frame so the
 * simulated unmount cancels the first run, and the instance is destroyed on a real unmount.
 */
export function ChartRenderer({type, config, className = "d3plus", onRender}: ChartRendererProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const vizRef = useRef<AnyRecord | null>(null);
  const configHash = hash(config);
  const latest = useRef(config);
  const rendered = useRef(onRender);
  useEffect(() => { latest.current = config; rendered.current = onRender; });

  useEffect(() => {
    const el = svgRef.current;
    const Chart = charts[type];
    if (!el || !Chart) return;
    const frame = requestAnimationFrame(() => {
      const viz = (vizRef.current ??= new Chart());
      applyConfig(viz as Parameters<typeof applyConfig>[0], el, theme, latest.current);
      viz.render(() => { if (vizRef.current === viz) rendered.current?.(viz); });
    });
    return () => cancelAnimationFrame(frame);
  }, [type, configHash]);

  // Also runs when Next.js hides a page it keeps for back navigation (React Activity), which keeps
  // the DOM: the chart drawn when the page is shown again starts from an empty <svg>, without the
  // old one's marks or the zoom that d3-zoom stores on the element.
  useEffect(() => {
    const el = svgRef.current;
    return () => {
      vizRef.current?.destroy?.();
      vizRef.current = null;
      if (el) {
        el.replaceChildren();
        delete (el as SVGSVGElement & {__zoom?: unknown}).__zoom;
      }
    };
  }, []);

  return (
    <div className={className} style={{height: "100%"}}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
