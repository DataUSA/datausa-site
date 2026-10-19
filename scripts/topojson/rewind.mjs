#!/usr/bin/env node
/**
 * Rewinds the polygons of public/topojson files that d3-geo reads inside out.
 *
 *   node scripts/topojson/rewind.mjs [file.json ...]    (default: every file in public/topojson)
 *
 * d3-geo takes a polygon's winding to say which side is inside, and a polygon wound the other way
 * covers the whole globe but itself. A few tiny places in the legacy Place_<state>.json files (Cove
 * Neck, NY; Oak Ridge North, TX) came out that way, collapsed to a sliver by quantization: their
 * state's report maps were fitted to the whole sphere and painted over, and their centroids landed
 * on the far side of the Earth. Reversing such a polygon's rings (the order of their arcs and the
 * direction of each) puts its inside back. Files with nothing to fix are left untouched.
 */
import {readdirSync, readFileSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {geoArea} from "d3-geo";
import {feature} from "topojson-client";

const dir = join(import.meta.dirname, "..", "..", "public", "topojson");
const files = process.argv.length > 2 ? process.argv.slice(2) : readdirSync(dir).filter(f => f.endsWith(".json")).map(f => join(dir, f));

const reverseRing = ring => ring.slice().reverse().map(arc => ~arc);
const inverted = (topology, arcs) => geoArea(feature(topology, {type: "Polygon", arcs})) > 2 * Math.PI;

for (const file of files) {
  const topology = JSON.parse(readFileSync(file, "utf8"));
  const fixed = [];
  for (const object of Object.values(topology.objects)) {
    for (const g of object.geometries ?? [object]) {
      if (g.type === "Polygon" && inverted(topology, g.arcs)) {
        g.arcs = g.arcs.map(reverseRing);
        fixed.push(g.id);
      }
      else if (g.type === "MultiPolygon") {
        let changed = false;
        g.arcs = g.arcs.map(polygon => {
          if (!inverted(topology, polygon)) return polygon;
          changed = true;
          return polygon.map(reverseRing);
        });
        if (changed) fixed.push(g.id);
      }
    }
  }
  if (!fixed.length) continue;
  writeFileSync(file, JSON.stringify(topology));
  console.log(`${file.split("/").pop()}: rewound ${fixed.join(", ")}`);
}
