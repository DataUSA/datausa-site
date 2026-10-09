// Converted from legacy canon_cms_section_visualization #313 "section majors" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorCIP, iconCIP, id, hierarchy, tesseract} = variables;
  const {abbreviateBig, commas} = formatters;
  const degreeMajors = swap("[[degree-majors]]").replace(/[A-z]/g, "");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=CIP6,Year,${hierarchy}&include=${hierarchy}:${id};Degree:${degreeMajors}&locale=en&measures=Completions&parents=true`,
    dataFormat: (resp: any) => {
      let data = resp.data;
    
      data.forEach((d: any) => {
        d["CIP2 ID"] = `${d["CIP2 ID"]}`
        d["CIP4 ID"] = `${d["CIP4 ID"]}`
        d["CIP6 ID"] = `${d["CIP6 ID"]}`
      })
    
      return data
    },
    groupBy: ["CIP2", "CIP4", "CIP6"],
    legend: true,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconCIP[d["CIP2 ID"]]
      }
    },
    sum: (d: any) => d["Completions"],
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d["Completions"])]
      ]
    },
    total: "Completions",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
