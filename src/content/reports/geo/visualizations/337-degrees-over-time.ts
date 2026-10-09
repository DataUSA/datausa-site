// Converted from legacy canon_cms_section_visualization #337 "section degrees-over-time" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {id, colorSector, tesseract, hierarchy} = variables;
  const {commas, abbreviate} = formatters;

  const colorDegrees: Record<string, any> = {
    1: "#3d7d73",
    2: "#41bf9a",
    3: "#8ffda3",
    4: "#2a69b7",
    5: "#7bcff8",
    6: "#ba62f8",
    7: "#8623ac",
    8: "#ed6691",
    17: "#f55d23",
    18: "#f99e44",
    19: "#fddf84"
  }

  const category = swap("[[degreesOrSector]]") // degreesOption, degreesOption
  const drilldown = category === "degreesOption" ? "Degree" : "Sector"

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,${drilldown}&include=${hierarchy}:${id}&locale=en&measures=Completions,Number+Of+Universities&exclude=Degree:20,21`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      data.forEach((d: any) => {
        d.Share = d.Completions / d["Number Of Universities"]
      })

      return data.filter((d: any) => d["Completions"] > 0);
    },
    discrete: "y",
    groupBy: [`${drilldown} ID`],
    height: 300,
    label: (d: any) => String(d[drilldown]),
    shapeConfig: {
      fill: category === "degreesOption" ? (d: any) => colorDegrees[d[`Degree ID`]] : (d: any) => colorSector[d[`Sector ID`]]
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        [
          "Completions",
          (d: any) => commas(d["Completions"])
        ]
      ]
    },
    type: "BarChart",
    x: "Share",
    xConfig: {
      title: "Completions",
      tickFormat: (d: any) => abbreviate(d)
    },
    y: drilldown,
    yConfig: {
      title: drilldown
    },
    ySort: (a: any, b: any) => a["Share"] - b["Share"]
  };
};

export default viz;
