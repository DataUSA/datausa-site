// Converted from legacy canon_cms_section_visualization #117 "section tmap_production" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {id, colorCommodityL0, vaFilter, tesseract, beaL0} = variables;
  const {abbreviate} = formatters;


  return {
    //data: `/api/data?Commodity L0=${id}&drilldowns=Industry L1&measures=Value Millions&parents=true`,
    data: `${tesseract}tesseract/data.jsonrecords?Commodity+L0=${beaL0}&cube=bea_use&drilldowns=Industry+L1,Year&measures=Value+Millions&parents=true`,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => !vaFilter.includes(d["Industry L0 ID"]));
  
      return data;
    },
    legendConfig: {
      label: ""
    },
    groupBy: ["Industry L0", "Industry L1"],
    shapeConfig: {
      fill: (d: any) => colorCommodityL0[d["Industry L0 ID"]] || "#000"
    },
    sum: "Value Millions",
    time: "Year",
    /*legendTooltip: {
      title: (d: any) => d["Industry L0"]
    },*/
    tooltipConfig: {
      title: (d: any) => {
        return `
          <div class='d3plus-tooltip-title-wrapper'>
            <div class="title-without-icon"><span>${d["Industry L1"] || d["Industry L0"]}</span></div>
            <div class="subtitle"><span>Industry</span></div>
          </div>
        `
      },
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
