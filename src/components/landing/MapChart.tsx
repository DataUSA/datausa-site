"use client";

import {configWarnings} from "@d3plus/core";
import {ChartRenderer} from "@/components/viz/ChartRenderer";
import {geomapShapeConfig} from "@/lib/viz/theme";

type AnyRecord = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

configWarnings(false);

/** A d3plus chart of a landing page; a map's shape styles go through the site's Geomap fixes. */
export function MapChart({type, config}: {type: string; config: AnyRecord}) {
  const fixed = type === "Geomap" && config.shapeConfig ? {...config, shapeConfig: geomapShapeConfig(config.shapeConfig)} : config;
  return <ChartRenderer type={type} config={fixed} />;
}
