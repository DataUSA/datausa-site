// Converted from legacy canon_cms_section_visualization #354 "section establishments" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {hierarchy, id, sizeSelected, stateSelected, tesseract, blsIdsStr} = variables;
  const {commas, abbreviate} = formatters;

  const drilldown: string = ""

  const dataUrl: string = `${tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,Size&include=Industry:${blsIdsStr}&locale=en&measures=Number+of+Establishments`

  return {
    data: dataUrl,
    dataFormat: (resp: any) => {
      let data = resp.data.map((d: any) => Object.assign({}, d));
    
      const updatedData = data.map((entry: any) => {
        if ([7, 8, 9].includes(entry["Size ID"])) {
          return {
            ...entry,
            "Size ID": 7,
            "Size": "250 or more Employees"
          };
        }
        return entry;
      });
        

      return updatedData
    },
    discrete: "y",
    groupBy: ["Size ID"],  
    height: 300,
    label: (d: any) => String(d["Size"]),
    shapeConfig: {
      fill: "D3PLUS-COMMON-RESET"
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Establishments", (d: any) => commas(d["Number of Establishments"])]
      ]
    },
    type: "BarChart",
    x: "Number of Establishments",
    xConfig: {
      tickFormat: (d: any) => abbreviate(d)
    },
    y: "Size",
    ySort: (a: any, b: any) => b["Size ID"] - a["Size ID"],
  };
};

export default viz;
