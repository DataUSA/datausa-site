// Converted from legacy canon_cms_section_visualization #357 "section median_earnings" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, albersUsaPr}) => {
  const {id, hierarchy, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const ids: Record<string, any> = {
    "11-21": "1",
    "23": "2",
    "31-33": "3",
    "42": "4",
    "44-45": "5",
    "48-49, 22": "6",
    "51": "7",
    "52-53": "8",
    "54-56": "9",
    "61-62": "10",
    "71-72": "11",
    "81": "13",
    "92": "14",
  }

  const acsID = ids[id]
  const dataURL: string = `${tesseract}calcs/acs.jsonrecords?cube=acs_ygi_industry_for_median_earnings_5&drilldowns=Industry+Group,State,Year&measures=Median%20Earnings%20by%20Industry,Median%20Earnings%20by%20Industry+Moe&include=Industry+Group:${acsID}`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const {data} = resp;
      return data
    },
    cache: false,
    colorScale: "Median Earnings by Industry",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => `${salary(d)}`,
        title: "Median Earnings"
      },
      scale: "linear"
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Median Earnings", (d: any) => salary(d["Median Earnings by Industry"])],
        ["Margin of Error", (d: any) => `± ${salary(d[`Median Earnings by Industry Moe`])}`],
      ] 
    },
    groupBy: "State ID",
    label: (d: any) => d.State,
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson:  `/topojson/State.json`,
    topojsonId: (d: any) => d.id,
    topojsonFilter: (d: any) => true,
    time: "Year",
    type: "Geomap"
  }
};

export default viz;
