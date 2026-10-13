/**
 * Approximate centre of every census place, for drawing places as points on the search map (there
 * is no national place shape file, only one per state). Computed once per process from the same
 * `public/topojson/Place_<state>.json` files the report maps draw, so it cannot drift from them.
 */
import {readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {geoCentroid} from "d3-geo";
import {feature} from "topojson-client";

type Point = [number, number];

let centroids: Map<string, Point> | null = null;

function load(): Map<string, Point> {
  const out = new Map<string, Point>();
  const dir = join(process.cwd(), "public", "topojson");
  for (const file of readdirSync(dir)) {
    if (!/^Place_\d{2}\.json$/.test(file)) continue;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topology = JSON.parse(readFileSync(join(dir, file), "utf8")) as any;
      const object = topology.objects[Object.keys(topology.objects)[0]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collection = feature(topology, object) as any;
      for (const f of collection.features ?? []) {
        const [lon, lat] = geoCentroid(f);
        if (f.id && Number.isFinite(lon) && Number.isFinite(lat)) out.set(String(f.id), [Math.round(lon * 1000) / 1000, Math.round(lat * 1000) / 1000]);
      }
    }
    catch (error) {
      console.error(`place centroids: could not read ${file}: ${(error as Error).message}`);
    }
  }
  return out;
}

/** `[longitude, latitude]` of a place (`16000US...`), or undefined when it has no shape. */
export function placeCentroid(id: string): Point | undefined {
  centroids ??= load();
  return centroids.get(id);
}
