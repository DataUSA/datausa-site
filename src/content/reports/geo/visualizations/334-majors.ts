// Converted from legacy canon_cms_section_visualization #334 "section majors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {colorCIP, iconCIP, id, tesseract, hierarchy} = variables;
  const {abbreviateBig, commas} = formatters;

  const degreeMajors = swap("[[degree-majors]]").replace(/[A-z]/g, "");

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=CIP6,Year&include=${hierarchy}:${id};Degree:${degreeMajors}&locale=en&measures=Completions&parents=true`,
    dataFormat: (resp: any) => {
      const data = resp.data;
    
      data.forEach((d: any) => {
        d["CIP2 ID"] = d["CIP2 ID"].toString().padStart(2, '0');
      })
    
      return data.filter((d: any) => d["Completions"] > 0);
    },
    groupBy: ["CIP2", "CIP6"],
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconCIP[`${d["CIP2 ID"]}`]
      }
    },
    shapeConfig: {
      fill: (d: any) => colorCIP[`${d["CIP2 ID"]}`]
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
