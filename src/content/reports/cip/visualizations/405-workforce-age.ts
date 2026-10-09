// Converted from legacy canon_cms_section_visualization #405 "section workforce_age" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorHighlight, iconGender, cip2, tesseract} = variables;
  const {nest, range, sum} = libs.d3;
  const {abbreviate, bucket, commas} = formatters;
  const measure: string = "Total Population";

  const data: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Age,CIP2&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Wage+Appx+MOE&include=CIP2:${cip2};Workforce+Status:true&filters=Record+Count.gte.5`

  return {
    aggs: {
      "Age": (arr: any, acc: any) => acc(arr[0])
    },
    data: data,
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
    groupBy: "CIP2",
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
      title: (d: any) => d.CIP2,
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
    x: "Age",
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
    xSort: (a: any, b: any) => a["Age"] - b["Age"],
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
