// Converted from legacy canon_cms_section_visualization #98 "section global_diversity" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {id} = variables;
  const {abbreviate, abbreviateBig} = formatters;

  const title = variables[swap("[[birthplace-measure-global_diversity]]")];
  const measure = title === "People in Workforce" ? "Total Population" : "ycbpop RCA";

  return {
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title
      }
    },
    data: `/api/data?CIP2=${id}&drilldowns=Nativity,Birthplace&measures=Total Population,ycbpop RCA,Record Count&Nativity=2&Workforce Status=true&properties=Country Code&Record Count>=5`,
    groupBy: "Country Code",
    label: (d: any) => d["Birthplace"],
    ocean: "#d4dadc",
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => `${abbreviateBig(d["Total Population"])}`],
        ["People in Workforce (RCA)", (d: any) => `${abbreviate(d["ycbpop RCA"])}`]
      ]
    },
    topojson: `/topojson/Birthplace.json`,
    topojsonFilter: (d: any) => !["ATA"].includes(d.id),
    type: "Geomap"
  };

};

export default viz;
