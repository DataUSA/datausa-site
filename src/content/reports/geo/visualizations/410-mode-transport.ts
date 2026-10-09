// Converted from legacy canon_cms_section_visualization #410 "section mode_transport" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {acsSingleYear, colorGrey, colorHighlight, iconGroup, id, tesseract, hierarchy} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket} = formatters;

  const measure: string = "Commute Means";

  return {
    data: `${tesseract}tesseract/data?cube=acs_ygt_means_of_transportation_to_work_5&measures=Commute+Means,Commute+Means+Moe&include=${hierarchy}:${id}&drilldowns=Year,Group`,
    dataFormat: (resp: any) => {
    
      const data = resp.data;
    
      nest()
        .key((d: any) => d.Year)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      
      return data;
    },
    discrete: acsSingleYear ? "y" : "x",
    groupBy: "Group ID",
    legend: true,
    legendConfig: {
      label: (d: any) => d["Group"],
      shapeConfig: {
        backgroundImage: (d: any) => iconGroup[d["Group ID"]]
      }
    },
    legendTooltip: {
      tbody: []
    },
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          // fontColor: (d: any) => d["ID Geography"] === id ? colorHighlight : colorGrey,
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12,
          fontStroke: "#E9E9E9",
          fontStrokeWidth: 0.1
        }
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Households", (d: any) => abbreviate(d[measure])],
        ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: acsSingleYear ? "BarChart" : "LinePlot",
    x: acsSingleYear ? measure : "Year",
    y: acsSingleYear ? "Group" : measure,
    [`${acsSingleYear ? "x" : "y"}Config`]: {
      scale: "log",
      tickFormat: abbreviate,
      title: "Number of Households (Log)"
    }
  }
};

export default viz;
