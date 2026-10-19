"use client";

import type {Feature, Geometry} from "geojson";
import type {Topology} from "topojson-specification";
import {feature} from "topojson-client";

/**
 * Shapes for the search map's point levels (places and school districts), which have one shape
 * file per state rather than a national one: the map loads a state's file once it is zoomed in far
 * enough to show the members of that state as shapes.
 */

export type Shape = Feature<Geometry> & {id: string};

/** File name prefix of each point level's per-state shape files (`Place_25.json`). */
const FILES: Record<string, string> = {"Place": "Place", "School District": "SchoolDistrict"};

const cache = new Map<string, Promise<Shape[] | null>>();

function loadFile(file: string, keep: (id: string) => boolean): Promise<Shape[] | null> {
  let request = cache.get(file);
  if (!request) {
    request = fetch(`/topojson/${file}.json`)
      .then(r => r.ok ? r.json() : null)
      .then((topology: Topology | null) => {
        if (!topology) return null;
        const object = topology.objects[Object.keys(topology.objects)[0]];
        const collection = feature(topology, object) as unknown as {features?: Shape[]};
        return (collection.features ?? []).filter(f => f.geometry && keep(String(f.id ?? "")));
      })
      .catch(() => null);
    cache.set(file, request);
    request.then(d => { if (!d) cache.delete(file); });
  }
  return request;
}

/** The members of a point level in one state (FIPS code), without the state's own outline that the place files carry. */
export function loadStateShapes(hierarchy: string, state: string): Promise<Shape[] | null> {
  const prefix = FILES[hierarchy];
  if (!prefix || !/^\d{2}$/.test(state)) return Promise.resolve(null);
  return loadFile(`${prefix}_${state}`, id => !id.startsWith("04000US"));
}

/** Every state, the backdrop drawn under the members. */
export function loadNationShapes(): Promise<Shape[] | null> {
  return loadFile("State", () => true);
}

/**
 * One topology holding the given shapes, for d3plus, which draws a single topojson object. The
 * shapes come from several files, each quantized its own way, so every ring becomes an arc of its
 * own instead of sharing borders. `key` names the set: the chart's config is compared by its JSON,
 * and a topology serializes as its key rather than as every coordinate it holds.
 */
export function toTopology(shapes: Shape[], key: string): Topology {
  const arcs: [number, number][][] = [];
  const ring = (coordinates: number[][]) => [arcs.push(coordinates as [number, number][]) - 1];
  const geometries: AnyGeometry[] = [];
  for (const shape of shapes) {
    const g = shape.geometry;
    if (g.type === "Polygon") geometries.push({type: "Polygon", id: shape.id, arcs: g.coordinates.map(ring)});
    else if (g.type === "MultiPolygon") geometries.push({type: "MultiPolygon", id: shape.id, arcs: g.coordinates.map(polygon => polygon.map(ring))});
  }
  const topology = {type: "Topology", arcs, objects: {shapes: {type: "GeometryCollection", geometries}}} as unknown as Topology;
  Object.defineProperty(topology, "toJSON", {value: () => `topology:${key}`});
  return topology;
}

type AnyGeometry = {type: "Polygon"; id: string; arcs: number[][]} | {type: "MultiPolygon"; id: string; arcs: number[][][]};
