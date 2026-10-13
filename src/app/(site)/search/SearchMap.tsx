"use client";

import {useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {formatters} from "@/content/formatters";
import type {SearchPageResult} from "@/content/search/dimensions";
import {ChartRenderer} from "@/components/viz/ChartRenderer";
import {clusterPoints} from "@/lib/geo/cluster";
import {isPendingLevel} from "@/lib/geo/levels";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {geomapShapeConfig, theme, tooltipTitle} from "@/lib/viz/theme";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Row = {id: string; name: string; population: number | null; label?: string};

/** Shape file of each geography level that can be drawn whole. Places and school districts have none (one file per state). */
const SHAPES: Record<string, {file: string; id: (d: AnyRecord) => string}> = {
  "State": {file: "State", id: d => d.id},
  "County": {file: "Counties_2023", id: d => d.properties.id},
  "MSA": {file: "Msa", id: d => d.id},
  "PUMA": {file: "PUMA", id: d => d.id},
  "Congressional District": {file: "Districts", id: d => d.id}
};

/** Levels drawn as points, clustered until the map is zoomed in: what one member is called in a cluster's tooltip. */
const POINT_LEVELS: Record<string, string> = {"Place": "places", "School District": "school districts"};

/** Every member of a point level, in columns (the response of `/api/geo/points`). */
interface LevelPoints {
  ids: string[];
  names: string[];
  lon: number[];
  lat: number[];
  population?: (number | null)[];
}

/** How far a cluster reaches on screen, in pixels, at a zoom step (it grows to 1.4 times this before the next step). */
const REACH = 48;
/** Clusters of at least this many members take the second colour. */
const LARGE_CLUSTER = 100;
const POINT_FILL = "rgba(135, 155, 245, 0.85)";
const CLUSTER_FILL = "#e2db93";
const LARGE_CLUSTER_FILL = "#f29bbd";
const SVG = "http://www.w3.org/2000/svg";
/** Sets this small (the listed results, before the level has loaded or under a query) are not clustered. */
const UNCLUSTERED = 150;
/** From this zoom on every point in view is drawn on its own. */
const SINGLES_ZOOM = 24;
const ZOOM_MAX = 64;
/** How far a click on a cluster zooms in. */
const CLUSTER_ZOOM = 3;
const IDENTITY = {k: 1, x: 0, y: 0};

/** Whether the search page has a map for this geography level. */
export const hasSearchMap = (hierarchy: string) => hierarchy in POINT_LEVELS || hierarchy in SHAPES;

// A sequential scale for the dark page: low values recede into the background, high ones glow.
const SCALE = ["#22335c", "#35508f", "#5571c4", "#879bf5", "#c8d2ff"];
const NO_DATA = "#16233f";
const PAGE = "#00112C";
const TEXT = "#a5abb6";
const OUTLINE = "#33456f";
const commas = new Intl.NumberFormat("en-US");

const pathFill = theme.shapeConfig.Path.fill as (this: unknown, d: AnyRecord, i: number) => string;
/** A state shape in a file of another level (drawn without data, so the datum is the shape itself). */
const isState = (d: AnyRecord) => String(d?.id ?? d?.feature?.id ?? "").startsWith("04000US");

/** Lower bounds of five classes holding the same number of geographies each. */
function quintiles(rows: Row[]): number[] {
  const values = rows.map(d => d.population).filter((v): v is number => typeof v === "number").sort((a, b) => a - b);
  if (values.length < SCALE.length) return values;
  return SCALE.map((_, i) => values[Math.floor(i * values.length / SCALE.length)]);
}

const escapeHtml = (text: string) => String(text).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

const cache = new Map<string, Promise<{year: number | null; data: Row[]}>>();
function loadLevel(level: string) {
  let request = cache.get(level);
  if (!request) {
    // `v` changes with the response's shape (2: district labels), so a browser's hour-long copy of
    // the previous shape is not reused
    request = fetch(`/api/geo/population?level=${encodeURIComponent(level)}&v=2`).then(r => r.ok ? r.json() : {year: null, data: []}).catch(() => ({year: null, data: []}));
    cache.set(level, request);
    request.then(d => { if (!d.data?.length) cache.delete(level); });
  }
  return request;
}

const pointCache = new Map<string, Promise<LevelPoints | null>>();
function loadPoints(level: string) {
  let request = pointCache.get(level);
  if (!request) {
    request = fetch(`/api/geo/points?level=${encodeURIComponent(level)}`).then(r => r.ok ? r.json() : null).then(d => d?.ids?.length ? d as LevelPoints : null).catch(() => null);
    pointCache.set(level, request);
    request.then(d => { if (!d) pointCache.delete(level); });
  }
  return request;
}

/**
 * Screen radius of a cluster, which grows with the logarithm of its member count (4 members 12px,
 * 1,000 the full 24px, half the reach, so neighbours barely overlap), or of a single point: sized by
 * population where there are figures, on a scale that grows with the zoom step, or every town in a
 * zoomed-in view would be the smallest dot; a plain dot otherwise. `shrink` scales the population
 * circles down on a small map.
 */
function radius(cluster: boolean, value: number | null, step: number, shrink: number): number {
  if (cluster) return Math.min(REACH / 2, 9 + 1.6 * Math.log2(Math.max(1, value ?? 1)));
  if (value === null) return 4;
  return Math.min(16 * shrink, 3 + 0.0062 * shrink * 2 ** (step / 2) * Math.sqrt(Math.max(0, value)));
}

/** A cluster's member count as written on it: "87", "1.6k", "12k". */
function countLabel(count: number): string {
  if (count < 1000) return String(count);
  return `${count < 9950 ? (count / 1000).toFixed(1).replace(/\.0$/, "") : Math.round(count / 1000)}k`;
}

/**
 * Zooms a d3plus map to `k` so that the point `at` (chart pixels before zoom) ends in the middle,
 * frame by frame: d3plus's own animated zoom reports nothing while it runs, and the points on this
 * map are held at their size from the zoom of each frame (`onFrame`). Every frame goes through
 * `_zoomToBounds`, which fits a box of screen pixels into the chart area less its padding.
 */
function animateZoom(viz: AnyRecord, at: [number, number], k: number, onFrame: (k: number) => void, done: () => void, ms = 450): () => void {
  const start = viz._zoomTransform ? {k: viz._zoomTransform.scale, x: viz._zoomTransform.x, y: viz._zoomTransform.y} : IDENTITY;
  const [[x0, y0], [x1, y1]] = viz._zoomBehavior.translateExtent() as [[number, number], [number, number]];
  const pad = 2 * (viz.schema?.zoomPadding ?? 0);
  const from = [at[0] * start.k + start.x, at[1] * start.k + start.y], to = [(x0 + x1) / 2, (y0 + y1) / 2];
  const began = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const t = Math.min(1, (now - began) / ms), e = 1 - (1 - t) ** 3;
    // the zoom the frame should have, and where the point should be on screen
    const scale = start.k * (k / start.k) ** e;
    const px = from[0] + (to[0] - from[0]) * e, py = from[1] + (to[1] - from[1]) * e;
    // the screen box, under the zoom of the moment, that `_zoomToBounds` turns into that view
    const cur = viz._zoomTransform ? {k: viz._zoomTransform.scale, x: viz._zoomTransform.x, y: viz._zoomTransform.y} : IDENTITY;
    const cx = (at[0] + (to[0] - px) / scale) * cur.k + cur.x, cy = (at[1] + (to[1] - py) / scale) * cur.k + cur.y;
    const w = (x1 - x0 - pad) / scale * cur.k / 2, h = (y1 - y0 - pad) / scale * cur.k / 2;
    viz._zoomToBounds([[cx - w, cy - h], [cx + w, cy + h]], 0);
    onFrame(viz._zoomTransform?.scale ?? 1);
    if (t < 1) frame = requestAnimationFrame(tick);
    else done();
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

interface Props {
  hierarchy: string;
  /** The listed results. With `filtered`, only these are coloured, and only these are drawn as points. */
  results: SearchPageResult[];
  filtered: boolean;
  year: number | null;
}

/**
 * Map beside the results when one geography level is selected: every state, county, metro area, PUMA
 * or district shaded by its latest population (only the matches once a query is typed). Places and
 * school districts are points: all of them, gathered into clusters that carry their member count
 * and split as the map is zoomed in, until each is drawn on its own (only the listed matches once a
 * query is typed). Single places are sized by population; school districts, which have no data yet,
 * are plain dots. Hovering names the geography; clicking opens its report, or zooms into a cluster.
 * The search page remounts the map when the level changes, which resets its zoom.
 */
export function SearchMap({hierarchy, results, filtered, year}: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{width: number; height: number} | null>(null);
  const [level, setLevel] = useState<{hierarchy: string; data: Row[]} | null>(null);
  const [all, setAll] = useState<{hierarchy: string; points: LevelPoints} | null>(null);
  // d3plus fits this instance to the map on every render, so it also tells where each point is drawn
  const projection = useMemo(() => albersUsaPr(), []);
  // where d3plus put the map: the fitted projection and the chart margin its coordinates start from
  const [fit, setFit] = useState<{key: string; left: number; top: number} | null>(null);
  const [view, setView] = useState(IDENTITY);
  const chart = useRef<AnyRecord | null>(null);
  const marksRef = useRef<AnyRecord[]>([]);
  const stopZoom = useRef<(() => void) | undefined>(undefined);
  const zoomTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const places = hierarchy in POINT_LEVELS;
  // a level without data has no population to size its points by, or to show in the tooltip
  const sized = !isPendingLevel(hierarchy);

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

  // nothing is loaded while the map is hidden (narrow screens)
  const shown = Boolean(size);
  useEffect(() => {
    if (!shown) return;
    let cancelled = false;
    if (places) loadPoints(hierarchy).then(points => { if (!cancelled && points) setAll({hierarchy, points}); });
    else loadLevel(hierarchy).then(d => { if (!cancelled) setLevel({hierarchy, data: d.data ?? []}); });
    return () => { cancelled = true; };
  }, [hierarchy, places, shown]);

  useEffect(() => () => { clearTimeout(zoomTimer.current); stopZoom.current?.(); }, []);

  /** Tells the stylesheet the zoom: it divides the points' radii and the counts' type size by it, so they hold their size on screen. */
  const holdSizes = useCallback((k: number) => { ref.current?.style.setProperty("--k", String(k)); }, []);

  /** Reads the map's zoom once it has settled: the clusters are rebuilt for where it ended up. */
  const followZoom = useCallback((delay = 200) => {
    clearTimeout(zoomTimer.current);
    zoomTimer.current = setTimeout(() => {
      const t = chart.current?._zoomTransform;
      const next = t ? {k: t.scale, x: t.x, y: t.y} : IDENTITY;
      setView(prev => Math.abs(prev.k - next.k) < 1e-6 && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5 ? prev : next);
    }, delay);
  }, []);

  /**
   * After each render: writes each cluster's member count on its circle, and gives every point its
   * screen radius as `--r`, which the stylesheet divides by the zoom (`--k`) so that points and
   * counts keep their size while the map is zoomed (d3plus scales the whole picture). d3plus draws
   * no labels on map points, so the texts are added to the group that holds the circles: they then
   * pan and zoom with them. The renderer joins its scene to every child of that group and fails on
   * one it did not create, except those of class `d3plus-trail` (its own transient motion trails,
   * switched off in the theme), so the texts carry that class.
   */
  const dressPoints = useCallback((viz: AnyRecord) => {
    const figure = ref.current;
    if (!figure) return;
    figure.querySelector("g.search-map-counts")?.remove();
    const rows = new Map<string, AnyRecord>();
    for (const d of marksRef.current) rows.set(`geomap-point-${d.id}`, d);
    holdSizes(viz._zoomTransform?.scale ?? 1);
    let group: SVGGElement | null = null;
    for (const circle of figure.querySelectorAll<SVGCircleElement>("circle[data-key^='geomap-point-']")) {
      const d = rows.get(circle.getAttribute("data-key") ?? "");
      if (!d || !circle.parentNode) continue;
      circle.style.setProperty("--r", String(d.r));
      if (!d.cluster) continue;
      if (!group) {
        group = document.createElementNS(SVG, "g");
        group.setAttribute("class", "d3plus-trail search-map-counts");
        circle.parentNode.appendChild(group);
      }
      const text = document.createElementNS(SVG, "text");
      text.setAttribute("transform", circle.getAttribute("transform") ?? "");
      text.setAttribute("dy", "0.35em");
      text.textContent = countLabel(d.count);
      group.appendChild(text);
    }
  }, [holdSizes]);

  const onRender = useCallback((viz: AnyRecord) => {
    dressPoints(viz);
    if (chart.current !== viz) {
      chart.current = viz;
      // d3plus has no zoom event of its own; its d3-zoom behavior takes a second, namespaced listener
      viz._zoomBehavior?.on("zoom.search", (event: AnyRecord) => { holdSizes(event.transform.k); followZoom(); });
    }
    const left = Number(viz._margin?.left) || 0, top = Number(viz._margin?.top) || 0;
    const key = `${projection.scale()}|${projection.translate()}|${left}|${top}`;
    setFit(prev => prev?.key === key ? prev : {key, left, top});
  }, [projection, followZoom, dressPoints, holdSizes]);

  // A query's matches can be anywhere, so a zoomed-in map goes back to the whole country for them.
  useEffect(() => {
    const viz = chart.current;
    if (!places || !filtered || !viz?._zoomTransform || viz._zoomTransform.scale <= 1 || typeof viz._zoomToBounds !== "function") return;
    stopZoom.current?.();
    viz._zoomToBounds(null, 0);
    holdSizes(1);
    followZoom(0);
  }, [places, filtered, results, followZoom, holdSizes]);

  // The points to draw: the whole level, or the listed results while it loads and once a query narrows them.
  const source = useMemo<LevelPoints | null>(() => {
    if (!places) return null;
    if (!filtered && all?.hierarchy === hierarchy) return all.points;
    const listed = results.filter(d => d.hierarchy === hierarchy && d.lonlat);
    return {
      ids: listed.map(d => d.id),
      names: listed.map(d => d.name),
      lon: listed.map(d => (d.lonlat as [number, number])[0]),
      lat: listed.map(d => (d.lonlat as [number, number])[1]),
      population: listed.map(d => d.population ?? null)
    };
  }, [places, filtered, all, hierarchy, results]);

  // Where each point is drawn in the chart before zoom (NaN outside the map: the Pacific territories).
  const projected = useMemo(() => {
    if (!source || !fit) return null;
    const xs = new Float64Array(source.ids.length), ys = new Float64Array(source.ids.length);
    for (let i = 0; i < xs.length; i++) {
      const p = projection([source.lon[i], source.lat[i]]);
      xs[i] = p ? p[0] + fit.left : NaN;
      ys[i] = p ? p[1] + fit.top : NaN;
    }
    return {source, xs, ys};
  }, [source, fit, projection]);

  // Clusters of the whole level at each zoom step, kept while the same points are projected the same way.
  const steps = useMemo(() => new Map<number, ReturnType<typeof clusterPoints>>(), [projected]); // eslint-disable-line react-hooks/exhaustive-deps

  // The points and clusters in view at the current zoom.
  const marks = useMemo(() => {
    if (!size || !source || !projected || projected.source !== source) return [];
    const {xs, ys} = projected;
    const {k, x, y} = view;
    const population = sized ? source.population : undefined;
    // half steps of zoom: a cluster's reach stays between REACH and 1.4 REACH on screen
    const step = Math.floor(Math.log2(Math.max(1, k)) * 2 + 1e-6) / 2;
    const reach = source.ids.length <= UNCLUSTERED || k >= SINGLES_ZOOM ? 0 : REACH / 2 ** step;
    let clustered = steps.get(reach);
    if (!clustered) steps.set(reach, clustered = clusterPoints(xs, ys, population, reach));
    const margin = 40;
    // population circles are drawn for a map 700px wide and scaled down on a narrower one
    const shrink = Math.min(1, Math.max(0.6, size.width / 700));
    const inView = (i: number) => {
      const sx = xs[i] * k + x, sy = ys[i] * k + y;
      return sx >= -margin && sx <= size.width + margin && sy >= -margin && sy <= size.height + margin;
    };
    const rows: AnyRecord[] = [];
    for (const i of clustered.singles) {
      if (!inView(i)) continue;
      rows.push({
        id: source.ids[i],
        name: source.names[i],
        population: population ? population[i] ?? null : null,
        lonlat: [source.lon[i], source.lat[i]],
        r: radius(false, population ? population[i] ?? 0 : null, step, shrink)
      });
    }
    for (const {seed, members} of clustered.clusters) {
      if (!inView(seed)) continue;
      const total = population ? members.reduce((sum, i) => sum + (population[i] ?? 0), 0) : 0;
      rows.push({
        id: `cluster-${step}-${source.ids[seed]}`,
        cluster: true,
        count: members.length,
        name: `${commas.format(members.length)} ${POINT_LEVELS[hierarchy]}`,
        population: population ? total : null,
        // the seed is the largest member
        ...(population ? {largest: source.names[seed]} : {}),
        lonlat: [source.lon[seed], source.lat[seed]],
        at: [xs[seed], ys[seed]],
        r: radius(true, members.length, step, shrink)
      });
    }
    return rows;
  }, [size, source, projected, steps, view, sized, hierarchy]);
  useEffect(() => { marksRef.current = marks; });

  const config = useMemo(() => {
    if (!size) return null;
    const open = (d: AnyRecord) => {
      if (d?.cluster) {
        const viz = chart.current;
        if (typeof viz?._zoomToBounds !== "function" || !viz._zoomBehavior) return;
        // the tooltip would stay on a cluster that is about to split
        viz._tooltipClass?.data([]).render();
        stopZoom.current?.();
        stopZoom.current = animateZoom(viz, d.at, Math.min(ZOOM_MAX, view.k * CLUSTER_ZOOM), holdSizes, () => followZoom(0));
      }
      else if (d && typeof d.id === "string") router.push(`/profile/geo/${d.id}`);
    };
    const common: AnyRecord = {
      width: size.width,
      height: size.height,
      groupBy: "id",
      label: (d: AnyRecord) => d.name,
      legend: false,
      // the map is redrawn as it is zoomed: no veil over it each time
      loadingMessage: false,
      ocean: "transparent",
      tiles: false,
      // wheel to zoom and drag to pan, with no buttons (they are hidden in search.css)
      zoom: true,
      zoomPan: true,
      zoomScroll: true,
      projection,
      on: {"click.shape": open},
      tooltipConfig: {
        // a district's familiar name ("Appalachian Kentucky") goes under its official one
        // (a cluster names its largest member there instead)
        title: (d: AnyRecord) => {
          const tagline = d.label ?? (d.largest ? `Largest: ${d.largest}` : "");
          return tooltipTitle("", undefined, `${escapeHtml(d.name)}${tagline ? `</span><span class="tagline">${escapeHtml(tagline)}` : ""}`, d.cluster ? false : hierarchy);
        },
        footer: (d: AnyRecord) => d.cluster ? "Click to zoom in" : "Click to open the report",
        tbody: sized ? [[year ? `${year} Population` : "Population", (d: AnyRecord) => d.population === null || d.population === undefined ? "N/A" : commas.format(d.population)]] : [],
        // no rows, no table: an empty one leaves a gap between the name and the footer
        ...(sized ? {} : {tableStyle: {display: "none"}})
      }
    };
    if (places) {
      // d3plus scales the whole picture with the zoom, so radii are divided by it to stay the same on
      // screen (between redraws the stylesheet does the same from `--r` and `--k`, see `dressPoints`)
      const radii = marks.map(d => d.r as number);
      const min = radii.length ? Math.min(...radii) : 4, max = radii.length ? Math.max(...radii) : 4;
      return {
        ...common,
        data: marks,
        point: (d: AnyRecord) => d.lonlat,
        pointSize: (d: AnyRecord) => d.r,
        pointSizeScale: "linear",
        pointSizeMin: min / view.k,
        pointSizeMax: max / view.k,
        zoomMax: ZOOM_MAX,
        topojson: "/topojson/State.json",
        topojsonFill: NO_DATA,
        shapeConfig: geomapShapeConfig({
          // clusters are solid discs in two colours by size, with their count written on them
          // (`dressPoints`) and an edge in the page colour that separates overlapping ones
          Circle: {
            fill: (d: AnyRecord) => d.cluster ? d.count >= LARGE_CLUSTER ? LARGE_CLUSTER_FILL : CLUSTER_FILL : POINT_FILL,
            stroke: (d: AnyRecord) => d.cluster ? PAGE : "#c8d2ff",
            strokeWidth: (d: AnyRecord) => d.cluster ? 1.5 : 1
          },
          Path: {fill: NO_DATA, fillOpacity: 1, stroke: PAGE, strokeOpacity: 1, strokeWidth: 1}
        })
      };
    }
    if (!level || level.hierarchy !== hierarchy) return null;
    const shape = SHAPES[hierarchy];
    const listed = filtered ? new Set(results.map(d => d.id)) : null;
    const data = listed ? level.data.filter(d => listed.has(d.id)) : level.data;
    return {
      ...common,
      data,
      colorScale: "population",
      colorScaleConfig: {
        color: SCALE,
        // equal-count classes: populations are so skewed that natural breaks leave nearly every shape
        // in the lowest one
        scale: "buckets",
        buckets: quintiles(data),
        axisConfig: {
          tickFormat: (d: number) => formatters.abbreviate(d),
          title: year ? `${year} Population` : "Population",
          shapeConfig: {labelConfig: {fontColor: () => TEXT}},
          titleConfig: {fontColor: () => TEXT}
        },
        legendConfig: {shapeConfig: {labelConfig: {fontColor: () => TEXT}}}
      },
      colorScalePosition: "bottom",
      topojson: `/topojson/${shape.file}.json`,
      topojsonId: shape.id,
      topojsonFill: NO_DATA,
      // thin borders in the page colour: they separate neighbours without outlining 3,000 counties in white
      shapeConfig: geomapShapeConfig({
        Path: {
          ...(hierarchy === "MSA" ? {
            // Msa.json ends with the 56 states (the backdrop of report maps), which would cover the
            // metro areas: here they are outlines only.
            fill(this: unknown, d: AnyRecord, i: number) { return isState(d) ? "transparent" : pathFill.call(this, d, i); },
            stroke: (d: AnyRecord) => isState(d) ? OUTLINE : PAGE
          } : {stroke: PAGE}),
          fillOpacity: 1,
          strokeOpacity: 1,
          strokeWidth: hierarchy === "State" ? 1 : 0.5
        }
      })
    };
  }, [size, places, sized, results, filtered, level, hierarchy, year, router, projection, marks, view, followZoom, holdSizes]);

  return (
    <div ref={ref} className="search-map-figure">
      {config && <ChartRenderer type="Geomap" config={config} onRender={onRender} />}
    </div>
  );
}
