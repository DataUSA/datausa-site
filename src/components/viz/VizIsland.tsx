"use client";

import {useEffect, useMemo, useRef, useState, type ComponentType} from "react";
import * as d3plus from "@d3plus/react";
import {configWarnings} from "@d3plus/core";
import {formatters} from "@/content/formatters";
import {getVizLoader} from "@/content/viz-registry";
import {libs} from "@/lib/content/libs";
import {swapTemplate} from "@/lib/template";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {theme} from "@/lib/viz/theme";
import type {VizConfig, VizDefinition} from "@/lib/reports/types";
import {useReport, useReportState} from "@/components/report/ReportProvider";
import {addSources, extractSources} from "./sources";
import {Options} from "./Options";
import {PrismMap} from "@/components/prism/PrismMap";
import styles from "./VizIsland.module.css";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

interface VizIslandProps {
  vizId: number;
  sectionSlug: string;
  profileSlug?: string;
  /** Which report's variables to use in comparison mode. */
  which?: "primary" | "comparison";
  title?: string;
  className?: string;
  options?: boolean;
  /** Overrides applied on top of the chart config (embeds, comparisons). */
  configOverride?: AnyRecord;
}

const charts: Record<string, ComponentType<{config: AnyRecord; className?: string}>> = {
  ...(d3plus as unknown as Record<string, ComponentType<{config: AnyRecord; className?: string}>>),
  PrismMap
};

// The shared theme deliberately carries options for every chart type (axis styling, map tiles,
// bar padding...). d3plus 4 would warn once per chart class for each key it does not use, so the
// warnings are off unless the page is opened with `?d3plus-warnings=1` (used to audit CMS configs).
configWarnings(typeof window !== "undefined" && new URLSearchParams(window.location.search).has("d3plus-warnings"));

type Built = {kind: "ok"; type: string; config: AnyRecord; title?: string} | {kind: "error"; error: string};

function useNearViewport<T extends HTMLElement>(margin = "600px"): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, {rootMargin: margin});
    observer.observe(el);
    return () => observer.disconnect();
  }, [margin, visible]);
  return [ref, visible];
}

/**
 * A chart island. Renders a sized placeholder on the server; in the browser, once the section nears
 * the viewport, it downloads the chart's config module, evaluates it against the report variables
 * and renders the matching `@d3plus/react` component.
 */
export function VizIsland({vizId, sectionSlug, profileSlug, which = "primary", title, className = "", options = true, configOverride}: VizIslandProps) {
  const {profileSlug: contextSlug, comparison} = useReport();
  const report = useReportState(which);
  const slug = profileSlug ?? contextSlug;
  const [ref, visible] = useNearViewport<HTMLDivElement>();
  const [definition, setDefinition] = useState<VizDefinition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || definition) return;
    const loader = getVizLoader(slug, vizId);
    if (!loader) { setError(`Unknown visualization ${vizId}`); return; }
    let cancelled = false;
    loader().then(mod => { if (!cancelled) setDefinition(() => mod.default); }).catch(err => { if (!cancelled) setError(String(err)); });
    return () => { cancelled = true; };
  }, [visible, definition, slug, vizId]);

  const built = useMemo<Built | null>(() => {
    if (!definition) return null;
    try {
      const swap = (template: string) => swapTemplate(template, {variables: report.variables, selectors: report.selectors, labels: report.labels});
      const config: VizConfig = definition(report.variables, {
        libs, formatters, locale: "en", variables: report.variables, selectors: report.selectors, swap, albersUsaPr
      });
      if (!config || typeof config !== "object") return {kind: "error", error: "Visualization code must return an object"};
      const merged: AnyRecord = {...config, ...configOverride};
      const type = merged.type as string | undefined;
      delete merged.type;
      if (!type) return {kind: "error", error: "Visualization has no type"};
      // d3plus 4 turns zoom on for every chart type; the legacy site only zoomed maps.
      if (type !== "Geomap" && merged.zoom === undefined) merged.zoom = false;
      // Legacy data-cart hook (feature removed); d3plus 4 would warn about the unknown key.
      delete merged.cart;
      // Comparison mode: race legends get crowded, so hide their labels (legacy behaviour)
      if (comparison) {
        const groupBy = (Array.isArray(merged.groupBy) ? merged.groupBy : [merged.groupBy]).filter((d: unknown) => typeof d === "string") as string[];
        if (groupBy.some(d => d.includes("Race"))) merged.legendConfig = {...(merged.legendConfig || {}), label: false};
      }
      // Defensive: a URL accidentally spread into characters (a legacy CMS typo) would flood the
      // server with one-letter requests; drop such fragments instead of fetching them.
      if (Array.isArray(merged.data) && merged.data.some((d: unknown) => typeof d === "string" && d.length < 4)) {
        console.warn(`Visualization ${vizId}: ignoring malformed data URL fragments`);
        merged.data = merged.data.filter((d: unknown) => !(typeof d === "string" && d.length < 4));
      }
      // Mobile: tighter bar spacing (legacy behaviour)
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        if (merged.groupPadding) merged.groupPadding = 5;
        if (merged.barPadding) merged.barPadding = 0;
      }
      if (type === "LinePlot" || typeof merged.shape === "function") {
        merged.shapeConfig = {...(merged.shapeConfig || {}), duration: 0};
      }
      const userFormat = merged.dataFormat;
      // Only charts that load data get the wrapper: a map drawn from topojson alone has no `data`,
      // and d3plus 4 warns about a stray `dataFormat` key.
      if (merged.data !== undefined) merged.dataFormat = (resp: unknown) => {
        addSources(sectionSlug, extractSources(resp));
        try {
          return userFormat ? userFormat(resp) : defaultDataFormat(resp, merged.data);
        }
        catch (err) {
          console.error(`Error in dataFormat of visualization ${vizId}:`, err);
          return [];
        }
      };
      return {kind: "ok", type, config: merged, title: (merged.title as string | undefined) ?? title};
    }
    catch (err) {
      console.error(`Error building visualization ${vizId}:`, err);
      return {kind: "error", error: `Error Rendering Visualization: ${(err as Error).message}`};
    }
  }, [definition, report, comparison, configOverride, sectionSlug, vizId, title]);

  const ok = built && built.kind === "ok" ? built : null;
  const failure = error ?? (built && built.kind === "error" ? built.error : null);
  const Chart = ok ? charts[ok.type] : undefined;
  const explicitHeight = ok && typeof ok.config.height === "number" ? ok.config.height : undefined;

  return (
    <div ref={ref} className={`${styles.container} ${className}`} data-viz-id={vizId} style={explicitHeight ? {minHeight: explicitHeight} : undefined}>
      {ok && options && Chart && (
        <Options config={ok.config} title={ok.title ?? title ?? "Data USA Visualization"} sectionSlug={sectionSlug} containerRef={ref} />
      )}
      <div className={styles.figure} style={explicitHeight ? {height: explicitHeight} : undefined}>
        {failure ? (
          <div className={styles.message}>{failure}</div>
        ) : ok && Chart ? (
          <d3plus.D3plusContext.Provider value={theme}>
            <Chart className="d3plus" config={ok.config} />
          </d3plus.D3plusContext.Provider>
        ) : ok && !Chart ? (
          <div className={styles.message}>{ok.type} is not a supported visualization type</div>
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

/** Legacy default: concatenate the `data` arrays of one or many responses. */
function defaultDataFormat(resp: unknown, data: unknown): unknown[] {
  const hasMultiples = Array.isArray(data) && data.length > 1 && data.some(d => typeof d === "string");
  const sources = (hasMultiples ? resp : [resp]) as AnyRecord[];
  return sources.flatMap(r => (r && Array.isArray(r.data) ? r.data : Array.isArray(r) ? r : []));
}
