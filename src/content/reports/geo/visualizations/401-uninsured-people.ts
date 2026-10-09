// Converted from legacy canon_cms_section_visualization #401 "section uninsured_people" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {nest, sum} = libs.d3;
  const {colorKaiser, id, isDistrict, hierarchy, tesseract} = variables;
  const {abbreviate} = formatters;

  const key: string = "Kaiser Coverage";
  const measure: string = "Health Insurance Policies";

  return {
    aggs: {
      [`${key} ID`]: (arr: any, acc: any) => acc(arr[0])
    },
    baseline: 0,
    data: `${tesseract}tesseract/data?cube=acs_ygh_health_care_coverage_overall_5&include=${hierarchy}:${id}&drilldowns=Year,Kaiser+Coverage&measures=Health+Insurance+Policies`,
    dataFormat: (resp: any) => {
      nest()
        .key((d: any) => d.Year)
        .entries(resp.data)
        .forEach((group: any) => {
          const {values} = group;
          const total = sum(values, (d: any) => d[measure]);
          values.forEach((d: any) => d.share = d[measure] / total * 100);
        });
      return resp.data;
    },
    discrete: isDistrict ? "y" : "x",
    groupBy: key,
    label: (d: any) => d[`${key} ID`] === 3 ? "Military or VA" : d[`${key} ID`] === 4 ? "Non-Group" : d[key],
    legendTooltip: {
      tbody: []
    },
    legend: !isDistrict,
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          fontColor: (d: any) => colorKaiser[d[`${key} ID`]],
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12,
          fontStroke: "#E9E9E9",
          fontStrokeWidth: 0.1
        },
        stroke: (d: any) => colorKaiser[d[`${key} ID`]]
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Coverage", (d: any) => `${abbreviate(d.share)}%`]
      ]
    },
    type: isDistrict ? "BarChart" : "LinePlot",
    y: isDistrict ? key : "share",
    [`${isDistrict ? "x" : "y"}Config`]: {
      tickFormat: (d: any) => `${abbreviate(d)}%`,
      title: "Spending Value"
    },
    x: isDistrict ? "share" : "Year"
  }
};

export default viz;
