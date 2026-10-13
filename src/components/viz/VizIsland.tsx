"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {configWarnings} from "@d3plus/core";
import {hash} from "@d3plus/dom";
import {formatters} from "@/content/formatters";
import {getVizLoader} from "@/content/viz-registry";
import {libs} from "@/lib/content/libs";
import {swapTemplate} from "@/lib/template";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {chartFonts, geomapShapeConfig} from "@/lib/viz/theme";
import type {VizConfig, VizDefinition} from "@/lib/reports/types";
import {useReport, useReportState} from "@/components/report/ReportProvider";
import {addSources, extractSources} from "./sources";
import {Options} from "./Options";
import {PrismMap} from "@/components/prism/PrismMap";
import {ChartRenderer, hasChart} from "./ChartRenderer";
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


// The shared theme deliberately carries options for every chart type (axis styling, map tiles,
// bar padding...). d3plus 4 would warn once per chart class for each key it does not use, so the
// warnings are off unless the page is opened with `?d3plus-warnings=1` (used to audit CMS configs).
configWarnings(typeof window !== "undefined" && new URLSearchParams(window.location.search).has("d3plus-warnings"));

/** The topics waiting on each data request, so one shared response can credit its sources to all. */
const sectionsByData = new Map<string, Set<string>>();
const dataKey = (data: unknown): string => typeof data === "string" ? data : JSON.stringify(data);

type Built = {kind: "ok"; type: string; config: AnyRecord; title?: string; state: string} | {kind: "error"; error: string};

function useNearViewport<T extends HTMLElement>(margin = "600px"): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!("IntersectionObserver" in window)) {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
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
 * Resolves once the chart fonts are loaded (or after a short timeout). d3plus 4 redraws a chart
 * when a font it measured text with finishes loading; on a fresh page that redraw overlaps the
 * chart's data load and the two renders apply the axis margins twice, so the chart waits.
 */
let fontsPromise: Promise<void> | undefined;
function chartFontsReady(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
  fontsPromise ??= Promise.race([
    Promise.all(chartFonts.map(family => document.fonts.load(`13px "${family}"`))).then(() => undefined),
    new Promise<void>(resolve => setTimeout(resolve, 3000))
  ]).catch(() => undefined);
  return fontsPromise;
}
function useChartFonts(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    chartFontsReady().then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);
  return ready;
}

/**
 * Measures the figure the chart draws into. d3plus 4 is given this size explicitly instead of
 * measuring the container itself: its own first measurement happens before the `height: 100%`
 * chain has resolved, its ResizeObserver then corrects it while the chart's data is still loading,
 * and the two overlapping renders apply the axis margins twice (half-height plots, missing bar
 * labels). With `width`/`height` in the config d3plus neither measures nor observes.
 */
function useFigureSize<T extends HTMLElement>(active: boolean): [React.RefObject<T | null>, {width: number; height: number} | null] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<{width: number; height: number} | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = {width: Math.round(rect.width), height: Math.round(rect.height)};
      if (next.width > 0 && next.height > 0) setSize(prev => prev && prev.width === next.width && prev.height === next.height ? prev : next);
    };
    const frame = requestAnimationFrame(measure);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    });
    observer?.observe(el);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); observer?.disconnect(); };
  }, [active]);
  return [ref, size];
}

/**
 * A chart island. Renders a sized placeholder on the server; in the browser, once the section nears
 * the viewport, it downloads the chart's config module, evaluates it against the report variables
 * and mounts the matching `@d3plus/core` chart (see `ChartRenderer`).
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
      // What the definition read from the selectors: part of the chart's identity (see `chartKey`).
      const swapped: Record<string, string> = {};
      const swap = (template: string) => swapped[template] = swapTemplate(template, {variables: report.variables, selectors: report.selectors, labels: report.labels});
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
      // d3plus 4 ignores fillOpacity/strokeOpacity on map paths; fold them into the colours.
      if (type === "Geomap") merged.shapeConfig = geomapShapeConfig(merged.shapeConfig);
      // The legacy stylesheet upper-cased axis titles (`.d3plus-Axis-title text`); d3plus 4 renders
      // titles as generic text nodes with no such class, so apply the transform to the config.
      for (const key of ["xConfig", "yConfig", "x2Config", "y2Config"]) {
        const axis = merged[key];
        if (axis && typeof axis === "object" && typeof axis.title === "string") merged[key] = {...axis, title: axis.title.toUpperCase()};
      }
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
        const sources = extractSources(resp);
        addSources(sectionSlug, sources);
        // d3plus loads a URL once and shares the result: when two topics ask for the same data (a
        // comparison of two places in one state), only one of them gets this call.
        sectionsByData.get(dataKey(merged.data))?.forEach(slug => addSources(slug, sources));
        try {
          return dropUndated(userFormat ? userFormat(resp) : defaultDataFormat(resp, merged.data), merged.time);
        }
        catch (err) {
          console.error(`Error in dataFormat of visualization ${vizId}:`, err);
          return [];
        }
      };
      return {kind: "ok", type, config: merged, title: (merged.title as string | undefined) ?? title, state: JSON.stringify(swapped)};
    }
    catch (err) {
      console.error(`Error building visualization ${vizId}:`, err);
      return {kind: "error", error: `Error Rendering Visualization: ${(err as Error).message}`};
    }
  }, [definition, report, comparison, configOverride, sectionSlug, vizId, title]);

  const ok = built && built.kind === "ok" ? built : null;
  const sharedData = ok && ok.config.data !== undefined ? dataKey(ok.config.data) : null;
  useEffect(() => {
    if (!sharedData) return;
    const sections = sectionsByData.get(sharedData) ?? new Set<string>();
    sections.add(sectionSlug);
    sectionsByData.set(sharedData, sections);
    return () => { sections.delete(sectionSlug); };
  }, [sharedData, sectionSlug]);
  // A chart whose config changed (a selector) is drawn by a new d3plus instance: `config()` merges
  // into what the instance already has, so settings the new config no longer mentions (a colour
  // scale's domain and midpoint, a label accessor) would survive from the previous option. The
  // selector values are part of the key because two options often differ only in what the config's
  // functions close over, which the hash of their source cannot see. Resizes keep the instance.
  const chartKey = useMemo(() => ok ? `${ok.type}|${ok.state}|${hash(ok.config)}` : "", [ok]);
  const failure = error ?? (built && built.kind === "error" ? built.error : null);
  const supported = ok ? ok.type === "PrismMap" || hasChart(ok.type) : false;
  const explicitHeight = ok && typeof ok.config.height === "number" ? ok.config.height : undefined;
  const [figureRef, figureSize] = useFigureSize<HTMLDivElement>(Boolean(ok && supported));
  const fontsReady = useChartFonts();
  const sizedConfig = useMemo(() => {
    if (!ok || !figureSize || !fontsReady) return null;
    return {...ok.config, width: figureSize.width, height: explicitHeight ?? figureSize.height};
  }, [ok, figureSize, explicitHeight, fontsReady]);

  return (
    <div ref={ref} className={`${styles.container} ${className}`} data-viz-id={vizId}>
      {ok && options && supported && (
        <Options config={ok.config} title={ok.title ?? title ?? "Data USA Visualization"} sectionSlug={sectionSlug} containerRef={ref} />
      )}
      <div ref={figureRef} className={styles.figure} style={explicitHeight ? {height: explicitHeight} : undefined}>
        {failure ? (
          <div className={styles.message}>{failure}</div>
        ) : ok && supported ? (
          sizedConfig && (ok.type === "PrismMap"
            ? <PrismMap config={sizedConfig} />
            : <ChartRenderer key={chartKey} type={ok.type} config={sizedConfig} />)
        ) : ok && !supported ? (
          <div className={styles.message}>{ok.type} is not a supported visualization type</div>
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

/**
 * Drops rows that have no value for the chart's `time` key. The gender pyramids build one row per
 * gender for every bucket and emit an empty one when a bucket has no men or no women (small race
 * groups, small places); the d3plus timeline cannot format a missing date, so the chart threw
 * instead of drawing (in the legacy site as well).
 */
function dropUndated(rows: unknown, time: unknown): unknown {
  if (!Array.isArray(rows) || typeof time !== "string" && typeof time !== "function") return rows;
  const timeOf = typeof time === "function" ? time as (d: AnyRecord, i: number) => unknown : (d: AnyRecord) => d[time];
  return rows.filter((d, i) => {
    const value = d ? timeOf(d, i) : undefined;
    return value !== undefined && value !== null && value !== "";
  });
}

/** Legacy default: concatenate the `data` arrays of one or many responses. */
function defaultDataFormat(resp: unknown, data: unknown): unknown[] {
  const hasMultiples = Array.isArray(data) && data.length > 1 && data.some(d => typeof d === "string");
  const sources = (hasMultiples ? resp : [resp]) as AnyRecord[];
  return sources.flatMap(r => (r && Array.isArray(r.data) ? r.data : Array.isArray(r) ? r : []));
}
