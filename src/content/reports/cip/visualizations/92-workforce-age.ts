// Converted from legacy canon_cms_section_visualization #92 "section workforce_age" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorHighlight, iconGender, idCIP2} = variables;
  const {nest, range, sum} = libs.d3;
  const {abbreviate, bucket, commas} = formatters;
  const measure: string = "Total Population";
  const measureEmbedded = measure.replace(/\s/g, "%20");

  return {
    aggs: {
      "ID Age": (arr: any, acc: any) => acc(arr[0])
    },
    data: `/api/data?CIP2=${idCIP2}&drilldowns=Age&measure=Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record%20Count&Record%20Count>=5&Workforce%20Status=true`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      return data;
    },
    discrete: "x",
    groupBy: "PUMS Degree Field",
    groupPadding: 10,
    legendTooltip: {
      tbody: []
    },
    shapeConfig: {
      Line: {stroke: (d: any) => colorHighlight},
      label: false
    },
    time: "Year",
    tooltipConfig: {
      title: (d: any) => d["PUMS Degree Field"] || d.CIP2,
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Age", (d: any) => d.Age],
        ["People in Workforce", (d: any) => commas(d[measure])],
        ["Margin of Error", (d: any) => `± ${commas(d[`${measure} MOE Appx`])}`],
        ["Average Salary", (d: any) => `± $${commas(d["Average Wage"])}`],
        ["Margin of Error", (d: any) => `± $${commas(d["Average Wage Appx MOE"])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "LinePlot",
    x: "ID Age",
    xConfig: {
      domain: range(16, 96, 1),
      gridConfig: {
        "stroke": "#ddd",
        "stroke-width": 1
      },
      ticks: range(16, 96, 1),
      tickSize: 5,
      labels: [16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
      title: "Age"
    },
    xSort: (a: any, b: any) => a["ID Age"] - b["ID Age"],
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
