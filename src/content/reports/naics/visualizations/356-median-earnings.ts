// Converted from legacy canon_cms_section_visualization #356 "section median_earnings" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {id, colorGrey, colorHighlight, tesseract} = variables;
  const {dollar, salary} = formatters;

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
  const dataURL: string = `${tesseract}calcs/acs.jsonrecords?cube=acs_ygi_industry_for_median_earnings_5&drilldowns=Industry+Group,Year&measures=Median%20Earnings%20by%20Industry,Median%20Earnings%20by%20Industry+Moe&include=Industry+Group:0,${acsID}`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      data.forEach((d: any) => {
        d["Industry Group"] = d["Industry Group ID"] * 1 === 0 ? "National" : d["Industry Group"]
      });
      return data
    },
    groupBy: [
      "Industry Group ID"
    ],
    height: 300,
    label: (d: any) => String(d["Industry Group"]),
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Industry Group ID"] * 1 === 0 ? colorGrey : colorHighlight
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Median Earnings by Industry", (d: any) => salary(d["Median Earnings by Industry"])],
        ["Margin of Error", (d: any) => `± ${salary(d[`Median Earnings by Industry Moe`])}`],
      ]
    },
    type: "LinePlot",
    x: "Year",
    xConfig: {
      title: ""
    },
    y: "Median Earnings by Industry",
    yConfig: {
      title: "Median Earnings",
      tickFormat: (d: any) => salary(d)
    }
  };
};

export default viz;
