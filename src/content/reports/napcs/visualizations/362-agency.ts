// Converted from legacy canon_cms_section_visualization #362 "section agency" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {id, hierarchy, tesseract} = variables;
  const {dollar} = formatters;

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=usa_spending&drilldowns=Agency,Fiscal+Year&include=${hierarchy}:${id}&locale=en&measures=Obligation+Amount&parents=true&time=Fiscal+Year.latest`

  return {
    data: dataURL,
    groupBy: ["Department", "Agency"],
    tooltipConfig: {
      tbody: [
        ["Department", (d: any) => d.Department],
        ["Fiscal Year", (d: any) => d.Year],
        ["Obligation Amount", (d: any) => dollar(d["Obligation Amount"])]
      ]
    },
    sum: "Obligation Amount",
    total: "Obligation Amount",
    totalFormat: (d: any) => `Total: ${dollar(d)}`,
    type: "Treemap"
  }
};

export default viz;
