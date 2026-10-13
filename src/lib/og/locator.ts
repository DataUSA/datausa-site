/**
 * Locator maps for the share images of location reports: the member's shape picked out in coral on
 * its surroundings (a state on the national map; a county, place, PUMA or district on its state).
 * Drawn from the same `public/topojson` files as the report maps, as plain SVG path strings.
 */
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {geoCentroid, geoConicEqualArea, geoPath, type GeoPermissibleObjects, type GeoProjection} from "d3-geo";
import {feature} from "topojson-client";
import {albersUsaPr} from "@/lib/viz/albers-usa-pr";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Topology = any;
type Geometry = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Locator {
  width: number;
  height: number;
  /** The surroundings, drawn muted. */
  context: string[];
  /** The member itself. */
  focus: string[];
  /** Ring drawn around a member too small to see at this scale. */
  marker?: [number, number];
}

/** Shape file and the level whose members it holds; levels inside one state are located on that state. */
const LEVELS: Record<string, {file: (stateFips: string) => string; inState: boolean}> = {
  "State": {file: () => "State", inState: false},
  "MSA": {file: () => "Msa", inState: false},
  "County": {file: () => "Counties_2023", inState: true},
  "Place": {file: fips => `Place_${fips}`, inState: true},
  "PUMA": {file: () => "PUMA", inState: true},
  "Congressional District": {file: () => "Districts", inState: true},
  "School District": {file: fips => `SchoolDistrict_${fips}`, inState: true}
};

/** The 50 states, DC and Puerto Rico: what the composite national projection can place. */
const onNationalMap = (id: string) => /^04000US(0[1-9]|[1-4]\d|5[0-6]|72)$/.test(id);
const SMALL = 28;
const PADDING = 6;

function readGeometries(file: string): {topology: Topology; geometries: Geometry[]} | null {
  if (!/^[A-Za-z0-9_]+$/.test(file)) return null;
  try {
    const topology = JSON.parse(readFileSync(join(process.cwd(), "public", "topojson", `${file}.json`), "utf8"));
    const object = topology.objects[Object.keys(topology.objects)[0]];
    return {topology, geometries: object.geometries ?? []};
  }
  catch {
    return null;
  }
}

const geometryId = (g: Geometry): string => String(g.id ?? g.properties?.id ?? "");

let states: {id: string; shape: GeoPermissibleObjects}[] | null = null;
function stateShapes(): {id: string; shape: GeoPermissibleObjects}[] {
  if (states) return states;
  const loaded = readGeometries("State");
  states = loaded ? loaded.geometries.map(g => ({id: geometryId(g), shape: feature(loaded.topology, g) as GeoPermissibleObjects})) : [];
  return states;
}

function memberShape(id: string, hierarchy: string): GeoPermissibleObjects | undefined {
  if (hierarchy === "State") return stateShapes().find(s => s.id === id)?.shape;
  const level = LEVELS[hierarchy];
  const loaded = level ? readGeometries(level.file(id.slice(7, 9))) : null;
  const geometry = loaded?.geometries.find(g => geometryId(g) === id);
  return geometry ? feature(loaded!.topology, geometry) as GeoPermissibleObjects : undefined;
}

/** A conic projection centred on one shape, so a single state is drawn upright rather than as it leans on the national map. */
function centredOn(shape: GeoPermissibleObjects, width: number, height: number): GeoProjection {
  const [lon, lat] = geoCentroid(shape);
  return geoConicEqualArea().rotate([-lon, 0]).center([0, lat]).parallels([lat - 2, lat + 2])
    .fitExtent([[PADDING, PADDING], [width - PADDING, height - PADDING]], shape);
}

function draw(projection: GeoProjection, context: GeoPermissibleObjects[], focus: GeoPermissibleObjects | undefined, width: number, height: number): Locator | null {
  const path = geoPath(projection).digits(1);
  const paths = (shapes: GeoPermissibleObjects[]) => shapes.map(s => path(s)).filter((d): d is string => Boolean(d));
  const locator: Locator = {width, height, context: paths(context), focus: focus ? paths([focus]) : []};
  if (!locator.context.length && !locator.focus.length) return null;
  if (focus) {
    if (!locator.focus.length) return null;
    const [[x0, y0], [x1, y1]] = path.bounds(focus);
    if (Math.max(x1 - x0, y1 - y0) < SMALL) {
      const [x, y] = path.centroid(focus);
      if (Number.isFinite(x) && Number.isFinite(y)) locator.marker = [Math.round(x), Math.round(y)];
    }
  }
  return locator;
}

/** The locator for a geography member, or null when it has no shape to show. */
export function geoLocator(id: string, hierarchy: string, width: number, height: number): Locator | null {
  try {
    const all = stateShapes();
    const national = all.filter(s => onNationalMap(s.id));
    if (!national.length) return null;
    const nationalProjection = () => albersUsaPr().fitExtent([[PADDING, PADDING], [width - PADDING, height - PADDING]], {type: "FeatureCollection", features: national.map(s => s.shape)} as never);

    if (hierarchy === "Nation") return draw(nationalProjection(), national.map(s => s.shape), undefined, width, height);

    const level = LEVELS[hierarchy];
    if (!level) return null;
    const shape = memberShape(id, hierarchy);
    if (!shape) return null;

    if (level.inState) {
      const state = all.find(s => s.id === `04000US${id.slice(7, 9)}`);
      if (!state) return draw(centredOn(shape, width, height), [], shape, width, height);
      return draw(centredOn(state.shape, width, height), [state.shape], shape, width, height);
    }

    // a state or metro area on the national map; territories the composite projection cannot place
    // are drawn on their own
    const others = national.filter(s => s.id !== id).map(s => s.shape);
    return draw(nationalProjection(), hierarchy === "State" ? others : national.map(s => s.shape), shape, width, height)
      ?? draw(centredOn(shape, width, height), [], shape, width, height);
  }
  catch (error) {
    console.error(`og locator: ${id}: ${(error as Error).message}`);
    return null;
  }
}
