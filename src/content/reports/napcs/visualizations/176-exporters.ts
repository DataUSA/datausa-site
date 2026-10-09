// Converted from legacy canon_cms_section_visualization #176 "section exporters" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorHighlight, id, exporterYear, sctg, tesseract} = variables;
  const {dollar} = formatters;
  const {nest} = libs.d3;
  const {merge} = libs.d3plus;

  const state: string = "Origin State";
  const measure: string = "Millions Of Dollars";

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?SCTG2=${sctg}&cube=dot_faf&drilldowns=Origin State,Year&measures=Millions Of Dollars`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      let data: any = [];
      nest()
        .key((d: any) => d.Year)
        .entries(resp.data)
        .forEach((group: any) => {
          const yearData: any = [];
          nest()
            .key((d: any) => d[state])
            .entries(group.values)
            .forEach((prod: any) => {
              yearData.push(merge(prod.values));
            });  
          const sorted = yearData.sort((a: any, b: any) => b[measure] - a[measure]).slice(0, 5);
          data = data.concat(sorted);
        });
      return data;
    },
    discrete: "y",
    groupBy: state,
    time: "Year",
    timelineConfig: {
      shapeConfig: {
        labelConfig: {
          fontColor(d: any) {
            const n = parseInt(d.text, 10);
            return isNaN(n) || n <= exporterYear ? "#888" : colorHighlight;
          },
        }
      }
    },
    timeFilter: (d: any) => d.Year == `${exporterYear}`,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Value", (d: any) => dollar(d[measure] * 1000000)]
      ]
    },
    type: "BarChart",
    x: measure,
    xConfig: {
      tickFormat: (d: any) => dollar(d * 1000000)
    },
    y: state,
    yConfig: {
      ticks: [],
      title: state
    },
    ySort: (a: any, b: any) => a[measure] - b[measure],
  }
};

export default viz;
