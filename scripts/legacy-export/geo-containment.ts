/**
 * Which geographies lie inside which, for the levels whose ids do not say so: places and school
 * districts in a county, counties and places in a metropolitan area. (What lies in a state is read
 * from the id: `05000US25009` is in `04000US25`.)
 *
 * Computed at build time from the shape files the maps already draw (`public/topojson`), so it
 * needs no network: a child belongs to the parent whose shape contains its interior point (from the
 * Census gazetteer or, for a school district, its boundary file; the centre of its own shape when it
 * has neither). A place or district that straddles a county line is therefore listed under one
 * county only.
 */
import {existsSync, readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";
import {geoCentroid} from "d3-geo";
import {feature} from "topojson-client";

type Point = [number, number];
type Ring = Point[];
interface Shape {id: string; polygons: Ring[][]; box: [number, number, number, number]}

export interface Containment {parent: string; child: string; level: string}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function readFeatures(path: string): AnyRecord[] {
  if (!existsSync(path)) return [];
  const topology = JSON.parse(readFileSync(path, "utf8")) as AnyRecord;
  const object = topology.objects[Object.keys(topology.objects)[0]];
  // some files carry the id on the geometry, others in its properties
  return ((feature(topology as never, object) as AnyRecord).features ?? [])
    .map((f: AnyRecord) => f.id ? f : {...f, id: f.properties?.id})
    .filter((f: AnyRecord) => f.geometry && f.id);
}

function toShape(f: AnyRecord): Shape {
  const polygons: Ring[][] = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const polygon of polygons) {
    for (const [x, y] of polygon[0] ?? []) {
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return {id: String(f.id), polygons, box: [x0, y0, x1, y1]};
}

function inRing([x, y]: Point, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function contains(shape: Shape, point: Point): boolean {
  const [x, y] = point;
  if (x < shape.box[0] || x > shape.box[2] || y < shape.box[1] || y > shape.box[3]) return false;
  // inside the outer ring of one of its polygons and in none of that polygon's holes
  return shape.polygons.some(([outer, ...holes]) => outer && inRing(point, outer) && !holes.some(hole => inRing(point, hole)));
}

const stateOf = (id: string) => id.slice(7, 9);

/**
 * @param points interior point (`[longitude, latitude]`) of geographies, by id
 * @param known ids that are members: relations to anything else are left out
 */
export function geoContainment(topojsonDir: string, points: Map<string, Point>, known: Set<string>): Containment[] {
  // the 2023 file: it has Connecticut's planning regions, which replaced its counties in the data
  const counties = readFeatures(join(topojsonDir, "Counties_2023.json"));
  const countiesByState = new Map<string, Shape[]>();
  for (const f of counties) {
    const shape = toShape(f);
    if (!known.has(shape.id)) continue;
    const state = stateOf(shape.id);
    if (!countiesByState.has(state)) countiesByState.set(state, []);
    countiesByState.get(state)!.push(shape);
  }
  // the metro file also carries the states' outlines
  const metros = readFeatures(join(topojsonDir, "Msa.json")).map(toShape).filter(s => s.id.startsWith("310") && known.has(s.id));
  const metroOf = (point: Point) => metros.find(m => contains(m, point));
  const finite = (p: Point) => Number.isFinite(p[0]) && Number.isFinite(p[1]);

  const out: Containment[] = [];
  const place = (id: string, point: Point, level: string, inMetro: boolean) => {
    if (!known.has(id) || !finite(point)) return;
    const county = (countiesByState.get(stateOf(id)) ?? []).find(c => contains(c, point));
    if (county) out.push({parent: county.id, child: id, level});
    if (inMetro) {
      const metro = metroOf(point);
      if (metro) out.push({parent: metro.id, child: id, level});
    }
  };

  for (const f of counties) {
    const id = String(f.id);
    if (!known.has(id)) continue;
    // a coastal county's interior point can fall outside the simplified metro shape: then its centre
    const point = points.get(id);
    const metro = (point && metroOf(point)) ?? metroOf(geoCentroid(f as never) as Point);
    if (metro) out.push({parent: metro.id, child: id, level: "County"});
  }
  const placed = new Set<string>();
  for (const [id, point] of points) {
    const prefix = id.slice(0, 3);
    if (prefix === "160") { place(id, point, "Place", true); placed.add(id); }
    else if (prefix === "950" || prefix === "960" || prefix === "970") place(id, point, "School District", false);
  }
  // places the gazetteer does not list: the centre of their shape, when they have one
  for (const file of readdirSync(topojsonDir)) {
    if (!/^Place_\d{2}\.json$/.test(file)) continue;
    for (const f of readFeatures(join(topojsonDir, file))) {
      const id = String(f.id);
      // the place files also carry their state's outline
      if (id.startsWith("160") && !placed.has(id)) place(id, geoCentroid(f as never) as Point, "Place", true);
    }
  }
  return out;
}
