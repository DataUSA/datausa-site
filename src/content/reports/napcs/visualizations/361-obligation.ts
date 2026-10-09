// Converted from legacy canon_cms_section_visualization #361 "section obligation" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {id, tesseract, hierarchy} = variables;
  const {dollar} = formatters;

  const monthNames: any = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=usa_spending&drilldowns=Month,${hierarchy}&include=${hierarchy}:${id}&locale=en&measures=Obligation+Amount&parents=true`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => {
        d.Date = `${d.Month}/01/${d.Year}`;
        return d;
      });
      return data;
    },
    discrete: "x",
    groupBy: hierarchy,
    tooltipConfig: {
      tbody: [
        ["Action Date", (d: any) => `${monthNames[d["Month"] - 1]} ${d.Year}`],
        ["Obligation Amount", (d: any) => dollar(d["Obligation Amount"])]
      ]
    },
    time: "Date",
    timeline: false,
    type: "LinePlot",
    x: "Date",
    y: "Obligation Amount",
    yConfig: {
      tickFormat: dollar,
      title: "Obligation Amount"
    }
  }
};

export default viz;
