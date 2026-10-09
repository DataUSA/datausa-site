"use client";

import {useMemo} from "react";
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";
import {D3plusContext} from "@d3plus/react";
import {configWarnings} from "@d3plus/core";
import {format} from "d3-format";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";
import {theme} from "@/lib/viz/theme";
import type {HomeGeomapRow} from "@/lib/home/geomap";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Loaded on the client only, after the rest of the page: the home page itself ships no d3plus.
const Geomap = dynamic(() => import("@d3plus/react").then(m => m.Geomap as unknown as React.ComponentType<{config: AnyRecord}>), {ssr: false, loading: () => <div className="viz" />});

configWarnings(false);
const abbreviate = format(".3s");

/** Clickable state map in the home page header (legacy `Home/index.jsx`). */
export function HomeGeomap({data}: {data: HomeGeomapRow[]}) {
  const router = useRouter();
  const config = useMemo<AnyRecord>(() => ({
    data,
    groupBy: "State ID",
    label: (d: AnyRecord) => d.State,
    legend: false,
    loadingHTML: "",
    ocean: "transparent",
    on: {click: (d: AnyRecord) => { if (d.slug) router.push(`/profile/geo/${d.slug}`); }},
    projection: albersUsaPr(),
    shapeConfig: {Path: {fill: "rgba(64, 74, 89, 0.4)", fillOpacity: 1, stroke: "#6d7b8e", strokeOpacity: 1, strokeWidth: 0.5}},
    tiles: false,
    tooltipConfig: {
      footer: `<img src="/icons/tooltip/template.svg" style="padding-right:2px;"/> Click to View Report`,
      tbody: [["Year", (d: AnyRecord) => d.Year], ["Population", (d: AnyRecord) => abbreviate(d.Population).replace("G", "B")]]
    },
    topojson: "/topojson/State.json",
    zoom: false
  }), [data, router]);
  if (!data.length) return <div className="viz" />;
  return (
    <div className="viz">
      <D3plusContext.Provider value={theme}>
        <Geomap config={config} />
      </D3plusContext.Provider>
    </div>
  );
}
