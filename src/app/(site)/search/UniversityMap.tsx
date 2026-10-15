"use client";

import {useMemo, type MouseEvent} from "react";
import {formatters} from "@/content/formatters";
import {ChartRenderer} from "@/components/viz/ChartRenderer";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {geomapShapeConfig, theme, tooltipTitle} from "@/lib/viz/theme";
import {escapeHtml, NO_DATA, PAGE, quintiles, SCALE, TEXT, useFigureSize} from "./map-shared";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** A state's universities (a row of `/api/university/states`). */
export interface UniversityState {
  id: string;
  name: string;
  universities: number;
  enrollment: number;
}

interface Props {
  states: UniversityState[];
  /** IPEDS year of the enrollment figures. */
  year: number | null;
  /** Geoid of the state the list is limited to, or "". */
  selected: string;
  onSelect: (id: string) => void;
}

const SELECTED = "#ef6145";
const commas = new Intl.NumberFormat("en-US");
const pathFill = theme.shapeConfig.Path.fill as (this: unknown, d: AnyRecord, i: number) => string;
/** d3plus marks each state's path with `data-key="geomap-path-<geoid>"`. */
const SHAPE_KEY = "geomap-path-";

/**
 * State map beside a list of universities: each state is shaded by how many universities it has,
 * and clicking one limits the list to that state (clicking it again brings every state back). The
 * selected state takes the accent colour. The island territories are not on the map; the menu above
 * the list has them.
 *
 * Clicks are read from the page on their way down to the map, not through d3plus's `click.shape`:
 * d3plus answers a click only once it has registered the hover, which takes it over half a second
 * on the first shape, so a quick first click did nothing (and once it does answer, it keeps the
 * click from bubbling). A drag that pans the map ends without a click: d3-zoom cancels it.
 */
export function UniversityMap({states, year, selected, onSelect}: Props) {
  const [ref, size] = useFigureSize();
  const projection = useMemo(() => albersUsaPr(), []);

  const config = useMemo(() => {
    if (!size || !states.length) return null;
    return {
      width: size.width,
      height: size.height,
      // The selection is part of the data, not of the functions below: the chart is redrawn when its
      // config changes, which is judged from the config's values and the functions' source.
      data: states.map(d => ({...d, selected: d.id === selected})),
      groupBy: "id",
      label: (d: AnyRecord) => d.name,
      legend: false,
      // the map is redrawn when a state is picked: no veil over it each time
      loadingMessage: false,
      ocean: "transparent",
      tiles: false,
      // wheel to zoom and drag to pan, with no buttons (they are hidden in search.css): the
      // north-eastern states are small targets
      zoom: true,
      zoomPan: true,
      zoomScroll: true,
      projection,
      colorScale: "universities",
      colorScaleConfig: {
        color: SCALE,
        // equal-count classes: California's 600 would leave most states in the lowest natural break
        scale: "buckets",
        buckets: quintiles(states.map(d => d.universities)),
        // whole universities: "21 - 45", where d3plus would write "21 - 45.9"
        bucketFormat: (tick: number, i: number, ticks: number[]) => {
          const next = ticks[i + 1];
          if (next === undefined) return `${commas.format(tick)}+`;
          return next - 1 > tick ? `${commas.format(tick)} - ${commas.format(next - 1)}` : commas.format(tick);
        },
        axisConfig: {
          tickFormat: (d: number) => formatters.abbreviate(d),
          title: "Universities",
          shapeConfig: {labelConfig: {fontColor: () => TEXT}},
          titleConfig: {fontColor: () => TEXT}
        },
        legendConfig: {shapeConfig: {labelConfig: {fontColor: () => TEXT}}}
      },
      colorScalePosition: "bottom",
      tooltipConfig: {
        title: (d: AnyRecord) => tooltipTitle("", undefined, escapeHtml(d.name), "State"),
        footer: (d: AnyRecord) => d.selected ? "Click to show every state" : "Click to list its universities",
        tbody: [
          ["Universities", (d: AnyRecord) => commas.format(d.universities)],
          [year ? `${year} Enrollment` : "Enrollment", (d: AnyRecord) => commas.format(d.enrollment)]
        ]
      },
      topojson: "/topojson/State.json",
      topojsonId: (d: AnyRecord) => d.id,
      topojsonFill: NO_DATA,
      shapeConfig: geomapShapeConfig({
        Path: {
          fill(this: unknown, d: AnyRecord, i: number) { return d?.selected ? SELECTED : pathFill.call(this, d, i); },
          fillOpacity: 1,
          stroke: PAGE,
          strokeOpacity: 1,
          strokeWidth: 1
        }
      })
    };
  }, [size, states, year, selected, projection]);

  const pick = (event: MouseEvent) => {
    const key = (event.target as Element).closest?.(`[data-key^='${SHAPE_KEY}']`)?.getAttribute("data-key");
    const id = key?.slice(SHAPE_KEY.length);
    if (id && states.some(d => d.id === id)) onSelect(id === selected ? "" : id);
  };

  return (
    <div ref={ref} className="search-map-figure university-map-figure" onClickCapture={pick}>
      {config && <ChartRenderer type="Geomap" config={config} />}
    </div>
  );
}
