// Converted from legacy canon_cms_section_visualization #379 "section races" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {hierarchy, id, colorGrey, colorHighlight, tesseract} = variables;
  const {abbreviate, growthPct, commas, salary} = formatters;
  const {sum, nest} = libs.d3;

  const selector = swap("[[races-employment]]") // employedR, unemployedR
  const workstatus = selector === "employedR" ? "true" : "false"

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CRace&include=${hierarchy}:${id};Workforce+Status:${workstatus}&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      libs.d3.nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Total Population"]);
          group.values.forEach((d: any) => d.share = d["Total Population"] / total);
        });
      return data;
    },
    height: 300,
    groupBy: ["Race ID"],
    label: (d: any) => String(d["Race"]),
    discrete: "y",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Total Population", (d: any) => commas(d["Total Population"])],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
      ]
    },
    type: "BarChart",
    x: "share",
    xConfig: {
      title: "Share",
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    y: "Race",
    ySort: (a: any, b: any) => a["share"] - b["share"],
    yConfig: {
      title: "Race"
    }
  };

  
};

export default viz;
