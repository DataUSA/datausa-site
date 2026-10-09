// Converted from legacy canon_cms_section_visualization #77 "section top_income" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorHighlight, id} = variables;
  const {abbreviate, commas, salary} = formatters;
  const measures: string = "Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,yocpop%20RCA,Record%20Count";

  return {
    data: `/api/data?CIP2=${id}&measure=${measures}&Workforce%20Status=true&drilldowns=Detailed%20Occupation&order=Total%20Population&sort=desc&limit=5:Year&Record%20Count>=5`,
    discrete: "y",
    groupBy: "Detailed Occupation",
    label: (d: any) => d["Detailed Occupation"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["People in Workforce (RCA)", (d: any) => abbreviate(d["yocpop RCA"])],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`]
      ]
    },
    type: "BarChart",
    x: "Average Wage",
    xConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: "Average Wage"
    },
    y: "Detailed Occupation",
    yConfig: {
      ticks: [],
      title: "Most Common Jobs"
    },
    ySort: (a: any, b: any) => a["Average Wage"] - b["Average Wage"]
  }
};

export default viz;
