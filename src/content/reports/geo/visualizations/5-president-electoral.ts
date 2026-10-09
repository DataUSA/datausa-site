// Converted from legacy canon_cms_section_visualization #5 "section president-electoral" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, albersUsaPr}) => {
  const {colorGrey, colorParty, tesseract} = variables;
  const {abbreviate} = formatters;
  const {nest} = libs.d3;
  
  return {
    data: `${tesseract}tesseract/data?cube=Data_USA_Electoral_College_president&drilldowns=State,Party,Year&measures=Electoral+College+Votes`, 
    dataFormat: (resp: any) => {
    
      const tops = nest()
        .key((d: any) => `${d.Year}_${d["State ID"]}`)
        .entries(resp.data)
        .map((group: any) => group.values[0]);

      return tops;
    
    },
    groupBy: ["State ID"],
    label: (d: any) => d.State instanceof Array ? d.Party : d.State,
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    shapeConfig: {
      Path: {
        fill: (d: any) => colorParty[d.Party] || colorGrey,
        fillOpacity: 1,
        strokeOpacity: 1
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Party", (d: any) => d.Party],
        ["Electoral Votes", (d: any) => d["Electoral College Votes"]]
      ]
    },
    topojson: "/topojson/State.json",
    time: "Year",
    type: "Geomap"
  };

};

export default viz;
