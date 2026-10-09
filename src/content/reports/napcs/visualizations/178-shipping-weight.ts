// Converted from legacy canon_cms_section_visualization #178 "section shipping-weight" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, exporterYear, id, name, transportAvg, sctg, tesseract} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;
  const {merge} = libs.d3plus;

  const mode: string = "Transportation Mode";
  const measure: string = "Thousands Of Tons";

  nest()
    .key((d: any) => d.Year)
    .entries(transportAvg)
    .forEach((group: any) => {
      const total = sum(group.values, (d: any) => d[measure]);
      group.values.forEach((d: any) => {
        d.share = d[measure] / total;
        d.product = "All Products";
        d.id = "all";
      });  
    });
  
  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?SCTG2=${sctg}&cube=dot_faf&measures=${measure}&drilldowns=${mode},Year`

  return {
   // data: `/api/data?SCTG2=${id}&measures=${measure}&drilldowns=${mode}`,
    data: dataURL,
    dataFormat: (resp: any) => {
      const data: any = [];
      nest()
        .key((d: any) => d.Year)
        .entries(resp.data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          nest()
            .key((d: any) => d[mode])
            .entries(group.values)
            .forEach((g: any) => {
              const d = merge(g.values);
              d.share = d[measure] / total;
              d.product = name;
              d.id = id;
              data.push(d);
            })
        });
      return data.concat(transportAvg);
    },
    groupBy: "product",
    legendTooltip: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Total Tons", (d: any) => abbreviate(d[measure] * 1000)]
      ]
    },
    shapeConfig: {
      fill: (d: any) => d.id === id ? colorHighlight : colorGrey,
      label: false
    },
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
    timeFilter: (d: any) => d.Year == exporterYear,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Transport", (d: any) => d[mode]],
        ["Tons", (d: any) => abbreviate(d[measure] * 1000)],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "BarChart",
    x: mode,
    xConfig: {
      labelRotation: false
    },
    xSort: (a: any, b: any) => a.id === "all" ? 1 : b.id === "all" ? -1 : b.share - a.share,
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
