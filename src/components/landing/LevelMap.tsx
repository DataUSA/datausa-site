"use client";

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {useEffect, useMemo, useRef, useState} from "react";
import {escapeHtml, NO_DATA, OUTLINE, PAGE, quintiles, SCALE, TEXT, useFigureSize} from "@/app/(site)/search/map-shared";
import type {LandingMapData} from "@/app/api/landing/map/route";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// d3plus is loaded only when a map is on the page and its data has arrived
const Chart = dynamic(() => import("./MapChart").then(m => m.MapChart), {ssr: false});

const commas = new Intl.NumberFormat("en-US", {maximumFractionDigits: 0});
const compact = new Intl.NumberFormat("en-US", {notation: "compact", maximumFractionDigits: 1});

function format(kind: string, value: number | null | undefined, short = false): string {
  if (value === null || value === undefined) return "N/A";
  if (kind === "dollars") return short ? `$${compact.format(value)}` : `$${commas.format(value)}`;
  if (kind === "compactDollars") return `$${compact.format(value)}`;
  if (kind === "age") return value.toFixed(1);
  if (kind === "percent") return `${(value * 100).toFixed(1)}%`;
  return short ? compact.format(value) : commas.format(value);
}

/** Id of a shape: on the geometry in most files, in its properties in the 2023 county file. */
const idOf = (d: AnyRecord) => String(d?.id ?? d?.properties?.id ?? d?.feature?.id ?? d?.feature?.properties?.id ?? "");
/** A state shape in a file of another level (the metro and place files carry the states). */
const isState = (d: AnyRecord) => idOf(d).startsWith("04000US");

interface LevelMapProps {
  /** Address of the map's data (`/api/landing/map?…`). */
  src: string;
  /** What the map shows, for screen readers. */
  label: string;
}

/**
 * The map of a landing page: every member of the level shaded by one of its figures, in five
 * classes holding the same number of members each. The buttons above it choose the figure; clicking a
 * shape opens its report (or, on a map of states, the level's page for that state).
 */
export function LevelMap({src, label}: LevelMapProps) {
  const router = useRouter();
  const [ref, size] = useFigureSize();
  const [data, setData] = useState<LandingMapData | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const national = useMemo(() => albersUsaPr(), []);

  useEffect(() => {
    let live = true;
    fetch(src)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(String(r.status))))
      .then((d: LandingMapData) => { if (live) { setData(d); setActive(0); } })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [src]);

  const column = data?.columns[Math.min(active, (data?.columns.length ?? 1) - 1)];

  const rows = useMemo(() => {
    if (!data) return [];
    return data.ids.map((id, i) => {
      const row: AnyRecord = {id, name: data.names[i], slug: data.slugs[i]};
      if (data.points) row.lonlat = data.points[i];
      if (data.places?.[i]) row.place = data.places[i];
      for (const c of [...data.columns, ...data.details ?? []]) row[c.key] = c.values[i];
      return row;
    });
  }, [data]);
  const byId = useRef(new Map<string, AnyRecord>());
  useEffect(() => { byId.current = new Map(rows.map(d => [String(d.id), d])); }, [rows]);

  const config = useMemo(() => {
    if (!size || !data || !column) return null;
    const inState = data.fips;
    // In a file of another level the states are a backdrop: outlines, so that scattered places
    // read as places in a state and not as specks.
    const backdrop = data.topojson !== "State";
    const drawn = (d: AnyRecord) => {
      const id = idOf(d);
      if (id.startsWith("04000US") && backdrop) return inState ? id.slice(7, 9) === inState : true;
      // secondary school districts lie over the elementary districts under them: one layer only
      if (id.startsWith("96000US")) return false;
      return inState ? id.slice(7, 9) === inState : true;
    };
    const shaded = rows.filter(d => d[column.key] !== null && d[column.key] !== undefined);
    // members as points (universities) over the state's own shape: sized by the figure, in one
    // translucent colour so that where they crowd together reads as brighter
    const points = data.points ? {
      point: (d: AnyRecord) => d.lonlat,
      pointSize: (d: AnyRecord) => d[column.key],
      pointSizeScale: "sqrt",
      pointSizeMin: 2.5,
      pointSizeMax: Math.max(8, Math.min(18, size.width / 60))
    } : {};
    return {
      ...points,
      width: size.width,
      height: size.height,
      data: shaded,
      groupBy: "id",
      label: (d: AnyRecord) => d.name,
      legend: false,
      loadingMessage: false,
      ocean: "transparent",
      tiles: false,
      zoom: false,
      ...(inState ? {projection: "geoMercator", fitFilter: drawn} : {projection: national}),
      topojson: `/topojson/${data.topojson}.json`,
      topojsonFilter: drawn,
      topojsonId: idOf,
      topojsonFill: NO_DATA,
      colorScale: column.key,
      colorScaleConfig: {
        color: SCALE,
        // equal-count classes: figures like population are so skewed that natural breaks leave
        // nearly every shape in the lowest one
        scale: "buckets",
        buckets: quintiles(shaded.map(d => d[column.key])),
        // whole counts read "23 - 59", where d3plus would write "23 - 59.9"
        ...(column.format === "number" ? {bucketFormat: (tick: number, i: number, ticks: number[]) => {
          const next = ticks[i + 1];
          if (next === undefined) return `${format("number", tick, true)}+`;
          return next - 1 > tick ? `${format("number", tick, true)} - ${format("number", next - 1, true)}` : format("number", tick, true);
        }} : {}),
        axisConfig: {
          tickFormat: (d: number) => format(column.format, d, true),
          title: `${column.year ? `${column.year} ` : ""}${column.label}`,
          shapeConfig: {labelConfig: {fontColor: () => TEXT}},
          titleConfig: {fontColor: () => TEXT}
        },
        legendConfig: {shapeConfig: {labelConfig: {fontColor: () => TEXT}}}
      },
      colorScalePosition: "bottom",
      ...(data.points ? {colorScale: false} : {}),
      tooltipConfig: {
        title: (d: AnyRecord) => `<div class='d3plus-tooltip-title-wrapper'><div class="title-without-icon"><span>${escapeHtml(d.name)}</span>${d.place ? `<span class="landing-tooltip-place">${escapeHtml(d.place)}</span>` : ""}</div></div>`,
        tbody: [...data.columns, ...data.details ?? []].map(c => [`${c.year ? `${c.year} ` : ""}${c.label}`, (d: AnyRecord) => format(c.format, d[c.key])]),
        ...(data.target === "none" ? {} : {footer: data.target === "state" ? "Click to zoom into the state" : "Click to open the report"})
      },
      shapeConfig: {
        Circle: {fill: SCALE[3], fillOpacity: 0.55, stroke: SCALE[4], strokeOpacity: 0.9, strokeWidth: 0.75},
        Path: {
          fillOpacity: (d: AnyRecord) => backdrop && isState(d) ? 0 : 1,
          stroke: (d: AnyRecord) => (backdrop && isState(d)) || data.points ? OUTLINE : PAGE,
          strokeOpacity: 1,
          strokeWidth: (d: AnyRecord) => backdrop && isState(d) ? 1.25 : data.topojson === "State" || inState ? 1 : 0.5
        }
      }
    };
  }, [size, data, column, rows, national]);

  // Clicks are read from the page (each mark's `data-key`), as on the search map: d3plus answers a
  // click only once it has registered the hover.
  const pick = (event: React.MouseEvent) => {
    const key = (event.target as Element).closest?.("[data-key^='geomap-']")?.getAttribute("data-key") ?? "";
    const d = byId.current.get(key.replace(/^geomap-(path|point)-/, ""));
    if (d?.slug && data) router.push(`${data.link}${d.slug}`);
  };

  if (failed) return null;
  return (
    <div className="landing-map">
      {data && data.columns.length > 1 && (
        <div className="landing-toggle" role="group" aria-label="Figure shown on the map">
          {data.columns.map((c, i) => (
            <button key={c.key} type="button" className={i === active ? "active" : ""} aria-pressed={i === active} onClick={() => setActive(i)}>{c.label}</button>
          ))}
        </div>
      )}
      <div ref={ref} className="landing-map-figure" role="img" aria-label={label} onClickCapture={pick}>
        {config && <Chart type="Geomap" config={config} />}
      </div>
    </div>
  );
}
