// Converted from legacy canon_cms_section_visualization #438 "section commute_time" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, salary} = formatters;

  const measure: string = "Average Commute Time";
  const cube: string = "acs_ygt_mean_transportation_time_to_work_5"

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy}&locale=en&measures=${measure}`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const dataID = resp.data;
      return dataID.filter((d: any) => d[hierarchy]);
    },
    discrete: "x",
    groupBy: `${hierarchy}`,
    height: 200,
    shapeConfig: {
      Line: {
        stroke:  colorHighlight
      }
    },
    time: "Year",
    timeline: false,
    tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        [measure, (d: any) => `${abbreviate(d[measure])} minutes`]
      ]
    },
    legend: false,
    type: "LinePlot",
    x: "Year",
    y: measure,
    yConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: "Average (mins)"
    },
  }
};

export default viz;
