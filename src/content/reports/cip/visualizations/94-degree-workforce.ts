// Converted from legacy canon_cms_section_visualization #94 "section degree_workforce" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorHighlight, id} = variables;
  const {abbreviate, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const measures: string = "Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,yocpop%20RCA,Record%20Count";

  return {
    data: `/api/data?CIP2=${id}&measure=${measures}&Workforce%20Status=true&drilldowns=Degree&order=Total%20Population&sort=desc&limit=5:Year&Record%20Count>=5`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      const msr: string = "Total Population";
      nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[msr]);
          group.values.forEach((d: any) => d.share = d[msr] / total);
        });
      return data;
    },
    discrete: "y",
    groupBy: "Degree",
    height: 250,
    label: (d: any) => d["Degree"],
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
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
      ]
    },
    type: "BarChart",
    x: "share",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    },
    y: "Degree",
    yConfig: {
      ticks: [],
      title: "Degree"
    },
    ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"]
  }
};

export default viz;
