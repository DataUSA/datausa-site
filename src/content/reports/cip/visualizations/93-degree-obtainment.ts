// Converted from legacy canon_cms_section_visualization #93 "section degree_obtainment" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorHighlight, id} = variables;
  const {abbreviate, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const measures: string = "Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,yocpop%20RCA";

  return {
    data: `/api/data?CIP=${id}&measure=Completions&drilldowns=Degree&order=Completions&sort=desc&limit=5:Year`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      const msr: string = "Completions";
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
        ["Degrees Awarded", (d: any) => commas(d["Completions"])],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`],
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
    ySort: (a: any, b: any) => a["Completions"] - b["Completions"]
  }
};

export default viz;
