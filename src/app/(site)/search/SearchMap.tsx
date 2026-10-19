"use client";

import {useRouter} from "next/navigation";
import {useCallback, useEffect, useMemo, useRef, useState, type MouseEvent} from "react";
import {geoPath} from "d3-geo";
import {formatters} from "@/content/formatters";
import type {SearchPageResult} from "@/content/search/dimensions";
import {ChartRenderer} from "@/components/viz/ChartRenderer";
import {clusterPoints} from "@/lib/geo/cluster";
import {isPendingLevel} from "@/lib/geo/levels";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {geomapShapeConfig, theme, tooltipTitle} from "@/lib/viz/theme";
import {escapeHtml, NO_DATA, OUTLINE, PAGE, quintiles, SCALE, TEXT, useFigureSize} from "./map-shared";
import {loadNationShapes, loadStateShapes, toTopology, type Shape} from "./map-shapes";

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
/** From this zoom on, the states in view draw their members as shapes instead of points. */
const SHAPES_ZOOM = 6;
/** A member whose shape would be smaller than this on screen, in pixels, stays a dot, which is easier to see and click. */
const MIN_SHAPE = 8;
/**
 * Radius of the dot of a member too small for its shape: the same for all, rather than sized by
 * population, or the dense suburbs of a large city would be a heap of overlapping discs.
 */
const SMALL_DOT = 3;
const SHAPE_FILL = "rgba(135, 155, 245, 0.5)";
const SHAPE_STROKE = "#c8d2ff";
const STATES = "/topojson/State.json";
/**
 * Secondary school districts cover the same ground as the elementary districts under them, so they
 * stay dots, drawn over the elementary shapes.
 */
const asShape = (id: string) => !id.startsWith("96000US");

/** Whether the search page has a map for this geography level. */
export const hasSearchMap = (hierarchy: string) => hierarchy in POINT_LEVELS || hierarchy in SHAPES;

const commas = new Intl.NumberFormat("en-US");

const pathFill = theme.shapeConfig.Path.fill as (this: unknown, d: AnyRecord, i: number) => string;
/** A state shape in a file of another level (drawn without data, so the datum is the shape itself). */
const isState = (d: AnyRecord) => String(d?.id ?? d?.feature?.id ?? "").startsWith("04000US");

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
 * are plain dots. Zoomed in to a few states (`SHAPES_ZOOM`), the states in view load their shape
 * files and draw their members as shapes, except those still too small to see or click, which stay
 * dots (as do secondary school districts, which overlap elementary ones). Hovering names the
 * geography; clicking opens its report, or zooms into a cluster. The search page remounts the map when the level changes, which resets its zoom.
 */
export function SearchMap({hierarchy, results, filtered, year}: Props) {
  const router = useRouter();
  const [ref, size] = useFigureSize();
  const [level, setLevel] = useState<{hierarchy: string; data: Row[]} | null>(null);
  const [all, setAll] = useState<{hierarchy: string; points: LevelPoints} | null>(null);
  // d3plus fits this instance to the map on every render, so it also tells where each point is drawn
  const projection = useMemo(() => albersUsaPr(), []);
  // where d3plus put the map: the fitted projection and the chart margin its coordinates start from
  const [fit, setFit] = useState<{key: string; left: number; top: number} | null>(null);
  const [view, setView] = useState(IDENTITY);
  // the member shapes of each state loaded so far (by FIPS code), and the states drawn behind them
  const [stateShapes, setStateShapes] = useState<Record<string, Shape[]>>({});
  const [nation, setNation] = useState<Shape[] | null>(null);
  const chart = useRef<AnyRecord | null>(null);
  const marksRef = useRef<AnyRecord[]>([]);
  const stopZoom = useRef<(() => void) | undefined>(undefined);
  const zoomTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const settledK = useRef(1);
  const places = hierarchy in POINT_LEVELS;
  // a level without data has no population to size its points by, or to show in the tooltip
  const sized = !isPendingLevel(hierarchy);

  // nothing is loaded while the map is hidden (narrow screens)
  const shown = Boolean(size);
  useEffect(() => {
    if (!shown) return;
    let cancelled = false;
    if (places) loadPoints(hierarchy).then(points => { if (!cancelled && points) setAll({hierarchy, points}); });
    else loadLevel(hierarchy).then(d => { if (!cancelled) setLevel({hierarchy, data: d.data ?? []}); });
    return () => { cancelled = true; };
  }, [hierarchy, places, shown]);

  // A page Next.js keeps for back navigation (React Activity) comes back with this state but a new
  // chart, zoomed out (see ChartRenderer): the map starts over from the whole country.
  useEffect(() => {
    const figure = ref.current;
    settledK.current = 1;
    setView(prev => prev === IDENTITY ? prev : IDENTITY);
    return () => {
      clearTimeout(zoomTimer.current);
      stopZoom.current?.();
      chart.current = null;
      figure?.style.removeProperty("--k");
    };
  }, [ref]);

  /** Tells the stylesheet the zoom: it divides the points' radii and the counts' type size by it, so they hold their size on screen. */
  const holdSizes = useCallback((k: number) => { ref.current?.style.setProperty("--k", String(k)); }, [ref]);

  /**
   * Reads the map's zoom once it has settled: the clusters are rebuilt for where it ended up. After a
   * zoom the tooltip is cleared, since the cluster it describes may have split or become shapes
   * under a pointer that has not moved (d3plus leaves it up until the pointer moves).
   */
  const followZoom = useCallback((delay = 200) => {
    clearTimeout(zoomTimer.current);
    zoomTimer.current = setTimeout(() => {
      const t = chart.current?._zoomTransform;
      const next = t ? {k: t.scale, x: t.x, y: t.y} : IDENTITY;
      if (Math.abs(settledK.current - next.k) >= 1e-6) chart.current?._tooltipClass?.data([]).render();
      settledK.current = next.k;
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
  }, [holdSizes, ref]);

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

  // The states with a member in view, once the map is zoomed in far enough for shapes (FIPS codes,
  // joined so that the same states compare equal from one zoom to the next).
  const shapeZoom = places && !filtered && view.k >= SHAPES_ZOOM && Boolean(all) && projected?.source === all?.points;
  const viewStates = useMemo(() => {
    if (!shapeZoom || !size || !projected) return "";
    const {source: points, xs, ys} = projected;
    const {k, x, y} = view;
    const found = new Set<string>();
    for (let i = 0; i < xs.length; i++) {
      const sx = xs[i] * k + x, sy = ys[i] * k + y;
      if (sx >= -40 && sx <= size.width + 40 && sy >= -40 && sy <= size.height + 40) found.add(points.ids[i].slice(7, 9));
    }
    return [...found].sort().join(",");
  }, [shapeZoom, size, projected, view]);

  useEffect(() => {
    if (!viewStates) return;
    let cancelled = false;
    if (!nation) loadNationShapes().then(d => { if (!cancelled && d) setNation(d); });
    for (const state of viewStates.split(",")) {
      if (stateShapes[state]) continue;
      loadStateShapes(hierarchy, state).then(d => { if (!cancelled && d) setStateShapes(prev => prev[state] ? prev : {...prev, [state]: d}); });
    }
    return () => { cancelled = true; };
  }, [viewStates, hierarchy, nation, stateShapes]);

  // The states in view whose shapes have loaded: their members are drawn as shapes.
  const drawn = useMemo(() => nation ? viewStates.split(",").filter(state => state && stateShapes[state]).join(",") : "", [nation, viewStates, stateShapes]);

  // How big each loaded shape is drawn before zoom: the longer side of its box, in chart pixels.
  const shapeSizes = useMemo(() => {
    const sizes = new Map<string, number>();
    if (!fit) return sizes;
    const path = geoPath(projection);
    for (const shapes of Object.values(stateShapes)) {
      for (const shape of shapes) {
        const [[x0, y0], [x1, y1]] = path.bounds(shape);
        if (Number.isFinite(x0)) sizes.set(shape.id, Math.max(x1 - x0, y1 - y0));
      }
    }
    return sizes;
  }, [fit, projection, stateShapes]);

  // What d3plus draws as paths: every state, and the members of the states in view.
  const topology = useMemo(() => {
    if (!drawn || !nation) return null;
    const members = drawn.split(",").flatMap(state => stateShapes[state].filter(d => asShape(d.id)));
    return toTopology([...nation, ...members], `${hierarchy}:${drawn}`);
  }, [drawn, nation, stateShapes, hierarchy]);

  // The points and clusters in view at the current zoom, and the shapes of the states drawn as shapes.
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
    const shaped = new Set(drawn ? drawn.split(",") : []);
    const inShapes = (i: number) => shaped.size > 0 && shaped.has(source.ids[i].slice(7, 9));
    const rows: AnyRecord[] = [];
    for (const i of clustered.singles) {
      if (!inView(i) || inShapes(i)) continue;
      rows.push({
        id: source.ids[i],
        name: source.names[i],
        population: population ? population[i] ?? null : null,
        lonlat: [source.lon[i], source.lat[i]],
        r: radius(false, population ? population[i] ?? 0 : null, step, shrink)
      });
    }
    for (const {seed, members} of clustered.clusters) {
      if (!inView(seed) || inShapes(seed)) continue;
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
    // in the states drawn as shapes, every member is a shape (whether in view or not, so that panning
    // does not change the data), except those too small to see at this zoom, which are dots
    if (shaped.size) {
      for (let i = 0; i < source.ids.length; i++) {
        if (!inShapes(i)) continue;
        const id = source.ids[i];
        const value = population ? population[i] ?? null : null;
        if (asShape(id) && (shapeSizes.get(id) ?? 0) * k >= MIN_SHAPE) rows.push({id, name: source.names[i], population: value, shape: true});
        else if (inView(i)) {
          rows.push({
            id,
            name: source.names[i],
            population: value,
            lonlat: [source.lon[i], source.lat[i]],
            r: SMALL_DOT
          });
        }
      }
    }
    return rows;
  }, [size, source, projected, steps, view, sized, hierarchy, drawn, shapeSizes]);
  useEffect(() => { marksRef.current = marks; });

  const config = useMemo(() => {
    if (!size) return null;
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
      const radii = marks.filter(d => !d.shape).map(d => d.r as number);
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
        // the states, with the members of those in view once zoomed in; the map is always fitted to
        // the states, so that it does not move when the shapes change
        topojson: topology ?? STATES,
        topojsonId: (d: AnyRecord) => d.id,
        fitObject: STATES,
        topojsonFill: NO_DATA,
        shapeConfig: geomapShapeConfig({
          // clusters are solid discs in two colours by size, with their count written on them
          // (`dressPoints`) and an edge in the page colour that separates overlapping ones
          Circle: {
            fill: (d: AnyRecord) => d.cluster ? d.count >= LARGE_CLUSTER ? LARGE_CLUSTER_FILL : CLUSTER_FILL : POINT_FILL,
            stroke: (d: AnyRecord) => d.cluster ? PAGE : "#c8d2ff",
            strokeWidth: (d: AnyRecord) => d.cluster ? 1.5 : 1
          },
          // members drawn as shapes are filled; the states, and the shapes of members drawn as dots, are backdrop
          Path: {
            fill: (d: AnyRecord) => d?.shape ? SHAPE_FILL : NO_DATA,
            fillOpacity: 1,
            stroke: (d: AnyRecord) => d?.shape ? SHAPE_STROKE : PAGE,
            strokeOpacity: 1,
            strokeWidth: (d: AnyRecord) => d?.shape ? 0.75 : isState(d) ? 1 : 0.5
          }
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
        buckets: quintiles(data.map(d => d.population)),
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
  }, [size, places, sized, results, filtered, level, hierarchy, year, projection, marks, view, topology]);

  // the rows drawn, by the id d3plus writes in each mark's `data-key`
  const rows = useRef(new Map<string, AnyRecord>());
  useEffect(() => { rows.current = new Map((config?.data as AnyRecord[] | undefined)?.map(d => [String(d.id), d])); }, [config]);

  /**
   * Opens the report of the shape or point clicked, or zooms into a cluster. Clicks are read from
   * the page on their way down to the map, as on the university map, not through d3plus's
   * `click.shape`: d3plus answers a click only once it has registered the hover, which can take
   * over half a second, so a quick click on a shape or dot did nothing. A drag that pans the map
   * ends without a click (d3-zoom cancels it). Shapes without a row (the states behind places)
   * do nothing.
   */
  const pick = (event: MouseEvent) => {
    const key = (event.target as Element).closest?.("[data-key^='geomap-']")?.getAttribute("data-key") ?? "";
    const d = rows.current.get(key.replace(/^geomap-(path|point)-/, ""));
    if (!d) return;
    if (d.cluster) {
      const viz = chart.current;
      if (typeof viz?._zoomToBounds !== "function" || !viz._zoomBehavior) return;
      // the tooltip would stay on a cluster that is about to split
      viz._tooltipClass?.data([]).render();
      stopZoom.current?.();
      stopZoom.current = animateZoom(viz, d.at, Math.min(ZOOM_MAX, (viz._zoomTransform?.scale ?? 1) * CLUSTER_ZOOM), holdSizes, () => followZoom(0));
    }
    else if (typeof d.id === "string") router.push(`/profile/geo/${d.id}`);
  };

  return (
    <div ref={ref} className="search-map-figure" onClickCapture={pick}>
      {config && <ChartRenderer type="Geomap" config={config} onRender={onRender} />}
    </div>
  );
}
