"use client";

import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {useMemo} from "react";
import {escapeHtml, useFigureSize} from "@/app/(site)/search/map-shared";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const Chart = dynamic(() => import("./MapChart").then(m => m.MapChart), {ssr: false});

export interface TreemapRow {
  id: string;
  name: string;
  slug: string;
  value: number;
  /** Formatted value, as the page prints it. */
  text: string;
  /** Name of the member one level up; rows of one group share a colour. */
  group?: string;
}

interface LevelTreemapProps {
  rows: TreemapRow[];
  /** Report family of the members (`/profile/<profile>/…`). */
  profile: string;
  /** What the areas measure ("2024 Workforce"). */
  measure: string;
  label: string;
}

// tints that sit on the light page next to any family colour, told apart by hue
const PALETTE = ["#879bf5", "#5cb3aa", "#ef7760", "#e2c84f", "#b29dc7", "#eea86c", "#7fb8e6", "#a3c86d", "#e58fb1", "#8a97ae", "#c9a27a", "#6fc7c9", "#d98a8a", "#9aa5f0", "#b9c26a", "#c79bd6"];

/** Every member of a level as a rectangle sized by its main figure and coloured by the group it belongs to; clicking one opens its report. */
export function LevelTreemap({rows, profile, measure, label}: LevelTreemapProps) {
  const router = useRouter();
  const [ref, size] = useFigureSize();
  const config = useMemo(() => {
    if (!size) return null;
    const groups = Array.from(new Set(rows.map(r => r.group ?? r.name)));
    const color = new Map(groups.map((g, i) => [g, PALETTE[i % PALETTE.length]]));
    const grouped = rows.some(r => r.group);
    return {
      width: size.width,
      height: size.height,
      data: rows,
      groupBy: grouped ? ["group", "id"] : ["id"],
      sum: "value",
      label: (d: AnyRecord) => Array.isArray(d.name) ? d.group : d.name,
      legend: false,
      loadingMessage: false,
      shapeConfig: {fill: (d: AnyRecord) => color.get(d.group ?? d.name) ?? PALETTE[0]},
      tooltipConfig: {
        title: (d: AnyRecord) => `<div class='d3plus-tooltip-title-wrapper'><div class="title-without-icon"><span>${escapeHtml(Array.isArray(d.name) ? d.group : d.name)}</span></div>${d.group && !Array.isArray(d.name) ? `<div class="subtitle"><span>${escapeHtml(d.group)}</span></div>` : ""}</div>`,
        tbody: [[measure, (d: AnyRecord) => Array.isArray(d.text) ? "" : d.text]],
        footer: "Click to open the report"
      },
      on: {click: (d: AnyRecord) => { if (typeof d.slug === "string") router.push(`/profile/${profile}/${d.slug}`); }}
    };
  }, [size, rows, profile, measure, router]);
  return (
    <div ref={ref} className="landing-treemap-figure" role="img" aria-label={label}>
      {config && <Chart type="Treemap" config={config} />}
    </div>
  );
}
