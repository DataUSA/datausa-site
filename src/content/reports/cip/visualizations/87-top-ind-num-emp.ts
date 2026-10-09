// Converted from legacy canon_cms_section_visualization #87 "section top_ind_num_emp" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorLeast, idCIP2} = variables;
  const {abbreviate, commas, salary} = formatters;
  const measures: string = "Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,yocpop%20RCA,Record%20Count";

  return {
    data: `/api/data?CIP2=${idCIP2}&measure=${measures}&Workforce%20Status=true&drilldowns=Industry%20Group&order=Total%20Population&sort=asc&limit=5:Year&Record%20Count>=5`,
    discrete: "y",
    groupBy: "Industry Group",
    height: 250,
    label: (d: any) => d["Industry Group"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: colorLeast
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
    x: "Total Population",
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title: "People in Workforce"
    },
    y: "Industry Group",
    yConfig: {
      ticks: [],
      title: "Least"
    },
    ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"]
  }
};

export default viz;
