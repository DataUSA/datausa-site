// Converted from legacy canon_cms_section_visualization #355 "section establishments" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, albersUsaPr}) => {
  const {id, hierarchy, tesseract, blsIdsStr} = variables;
  const {abbreviate, commas, dollar} = formatters;

  const dataUrl: string = `${tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,State&include=Industry:${blsIdsStr}&locale=en&measures=Number+of+Establishments`

  return {
    data: dataUrl,
    dataFormat: (resp: any) => {
      const {data} = resp;
      return data
    },
    cache: false,
    colorScale: "Number of Establishments",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => `${abbreviate(d)}`,
        title: "Establishments"
      },
      scale: "log"
    },
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
          customTooltip = [
            ["Year", d["Year"]],
            ["Establishments", commas(d["Number of Establishments"])],
          ] 
        return customTooltip;
      }
    },
    groupBy: "State ID",
    label: (d: any) => d.State,
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    topojson:  `/topojson/State.json`,
    topojsonId: (d: any) => d.id,
    topojsonFilter: (d: any) => true,
    time: "Year",
    type: "Geomap"
  }
};

export default viz;
