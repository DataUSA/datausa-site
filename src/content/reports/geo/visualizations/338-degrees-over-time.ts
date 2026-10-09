// Converted from legacy canon_cms_section_visualization #338 "section degrees-over-time" (profile: geo) by scripts/legacy-export/extract.ts.
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

  //const dataURL = `/api/data?Geography=${id}&drilldowns=${drilldown},Year&measures=Completions`
  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,${drilldown}&include=${hierarchy}:${id}&locale=en&measures=Completions&exclude=Degree:20,21`


  return {
    data: data,
    groupBy: [`${drilldown} ID`],
    label: (d: any) => String(d[drilldown]),
    legend: false,
    shapeConfig: {
      fill: category === "degreesOption" ? (d: any) => colorDegrees[d[`Degree ID`]] : (d: any) => colorSector[d[`Sector ID`]]
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        ["Completions", (d: any) => commas(d["Completions"])]
      ]
    },
    type: "StackedArea",
    x: "Year",
    xConfig: {
      title: "Year"
    },
    y: "Completions",
    yConfig: {
      tickFormat: (d: any) => abbreviate(d),
      title: "Completions"
    }
  };
};

export default viz;
