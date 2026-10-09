// Converted from legacy canon_cms_section_visualization #315 "section gender_men" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorMost, id, colorCIP, tesseract, hierarchy} = variables;
  const {abbreviate, commas, salary} = formatters;

  return {
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,CIP6&include=${hierarchy}:${id};Gender:1&locale=en&measures=Completions&top=5.Year.Completions.desc`,
    dataFormat: (resp: any) => {
      let data = resp.data;
      return data;
    },
    discrete: "y",
    groupBy: "CIP6",
    height: 250,
    label: (d: any) => d["CIP6"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill:  (d: any) => colorCIP[`${d["CIP6 ID"]}`.slice(0,2)] || "#A14E3B",
    },
    legend: false,
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Degrees Awarded", (d: any) => commas(d["Completions"])]
      ]
    },
    type: "BarChart",
    x: "Completions",
    xConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title: "Degrees Awarded"
    },
    y: "CIP6",
    yConfig: {
      ticks: [],
      title: ""
    },
    ySort: (a: any, b: any) => a["Completions"] - b["Completions"]
  }
};

export default viz;
