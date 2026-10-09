// Converted from legacy canon_cms_section_visualization #75 "section counties_most_degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, albersUsaPr}) => {
  const {id} = variables;
  const {abbreviate, commas} = formatters;

  const measure: string = "Completions";
  const measureEncoded = measure.replace(/\s/g, "%20");

  return {
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title: "Degrees Awarded"
      }
    },
    data: `/api/data?CIP=${id}&drilldowns=County&measure=${measureEncoded}`,
    groupBy: "ID County",
    height: 500,
    label: (d: any) => d["County"],
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d.Completions)]
      ]
    },
    ocean: "transparent",
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoAlbersUsa",
    topojson: `/topojson/County.json`,
    time: "Year",
    type: "Geomap"
  };

};

export default viz;
