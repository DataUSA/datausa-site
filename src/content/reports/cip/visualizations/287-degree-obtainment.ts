// Converted from legacy canon_cms_section_visualization #287 "section degree_obtainment" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorHighlight, id, hierarchy, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&include=${hierarchy}:${id}&drilldowns=Degree%2CYear&locale=en&measures=Completions&sort=Completions.desc`

  return {
    data: data,
    dataFormat: (resp: any) => {
      const data = resp.data;

      const nestedData = nest()
        .key((d: any) => `${d.Year}`)
        .entries(data);
    
      nestedData.forEach((group: any) => {
        const total = sum(group.values, (d: any) => d["Completions"]);
        group.values.forEach((d: any) => d.share = d["Completions"] / total);
      
        group.values.sort((a: any, b: any) => b.share - a.share);
        group.values = group.values.slice(0, 5);
      });
  
      return nestedData.flatMap((group: any) => group.values);
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
