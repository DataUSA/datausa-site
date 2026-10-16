"use client";

import {useMemo, type MouseEvent} from "react";
import {useRouter} from "next/navigation";
import {ChartRenderer} from "@/components/viz/ChartRenderer";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {geomapShapeConfig, tooltipTitle} from "@/lib/viz/theme";
import {escapeHtml, NO_DATA, PAGE, quintiles, TEXT, useFigureSize} from "@/app/(site)/search/map-shared";
import type {StateRate} from "@/lib/latest/indicators";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Warm sequential scale for the dark section: the highest rates are the brightest. */
const RATES = ["#3a2a45", "#6a3550", "#a3434f", "#d9604c", "#f39c6b"];
const SHAPE_KEY = "geomap-path-";
const pct = (v: number) => `${v.toFixed(1)}%`;

/**
 * Unemployment rate by state, shaded in five equal-count classes. Clicking a state opens its
 * report. Clicks are read on their way down to the map (as on the search page's map), because
 * d3plus ignores a click made before it has registered the hover.
 */
export function StateUnemploymentMap({rows, period}: {rows: StateRate[]; period: string}) {
  const router = useRouter();
  const [ref, size] = useFigureSize();
  const projection = useMemo(() => albersUsaPr(), []);
  const config = useMemo(() => {
    if (!size || !rows.length) return null;
    return {
      width: size.width,
      height: size.height,
      data: rows,
      groupBy: "id",
      label: (d: AnyRecord) => d.name,
      colorScale: "rate",
      colorScaleConfig: {
        color: RATES,
        scale: "buckets",
        buckets: quintiles(rows.map(d => d.rate)),
        bucketFormat: (tick: number, i: number, ticks: number[]) => {
          const next = ticks[i + 1];
          return next === undefined ? `${pct(tick)}+` : `${pct(tick)} – ${pct(Math.max(tick, next - 0.1))}`;
        },
        axisConfig: {title: "Unemployment rate", shapeConfig: {labelConfig: {fontColor: () => TEXT}}, titleConfig: {fontColor: () => TEXT}},
        legendConfig: {shapeConfig: {labelConfig: {fontColor: () => TEXT}}}
      },
      colorScalePosition: "bottom",
      legend: false,
      loadingMessage: false,
      ocean: "transparent",
      tiles: false,
      zoom: false,
      projection,
      topojson: "/topojson/State.json",
      topojsonId: (d: AnyRecord) => d.id,
      topojsonFill: NO_DATA,
      shapeConfig: geomapShapeConfig({Path: {fillOpacity: 1, stroke: PAGE, strokeOpacity: 1, strokeWidth: 1}}),
      tooltipConfig: {
        title: (d: AnyRecord) => tooltipTitle("", undefined, escapeHtml(d.name), period),
        footer: "Click to view the state's report",
        tbody: [
          ["Unemployment rate", (d: AnyRecord) => pct(d.rate)],
          ["A year earlier", (d: AnyRecord) => d.yearAgo === null ? "Not available" : pct(d.yearAgo)]
        ]
      }
    };
  }, [size, rows, period, projection]);

  const open = (event: MouseEvent) => {
    const key = (event.target as Element).closest?.(`[data-key^='${SHAPE_KEY}']`)?.getAttribute("data-key");
    const row = rows.find(r => r.id === key?.slice(SHAPE_KEY.length));
    if (row) router.push(`/profile/geo/${row.slug}`);
  };

  return (
    <div ref={ref} className="state-map-figure" onClickCapture={open}>
      {config && <ChartRenderer type="Geomap" config={config} />}
    </div>
  );
}
