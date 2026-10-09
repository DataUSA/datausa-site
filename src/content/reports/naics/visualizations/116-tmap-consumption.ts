// Converted from legacy canon_cms_section_visualization #116 "section tmap_consumption" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {id, colorCommodityL0, vaFilter, tesseract, beaL0} = variables;
  const {abbreviate} = formatters;

  return {
    //data: `/api/data?Industry L0=${id}&drilldowns=Commodity L1&measures=Value Millions&parents=true`,
    data: `${tesseract}tesseract/data.jsonrecords?Industry+L0=${beaL0}&cube=bea_use&drilldowns=Commodity+L1,Year&measures=Value+Millions&parents=true`,
    dataFormat: (resp: any) => {
      return resp.data.filter((d: any) => !vaFilter.includes(d["Commodity L0 ID"]));
    },
    legendConfig: {
      label: ""
    },
    groupBy: ["Commodity L0", "Commodity L1"],
    shapeConfig: {
      fill: (d: any) => colorCommodityL0[d["Commodity L0 ID"]] || "#000"
    },
    sum: "Value Millions",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Value", (d: any) => `$${abbreviate(d["Value Millions"] * 1000000)}`]
      ]
    },
    total: "Value Millions",
    totalFormat: (d: any) => `Total: $${abbreviate(d * 1000000)}`,
    type: "Treemap"
  }


};

export default viz;
