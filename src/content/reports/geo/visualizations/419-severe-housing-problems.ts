// Converted from legacy canon_cms_section_visualization #419 "section severe_housing_problems" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, albersUsaPr}) => {
  const {abbreviate, commas, growthPct} = formatters;
  const {colorScaleBad, countyDataGeoIDs, id, hierarchy, tesseract} = variables;

  const measure: string = "Severe Housing Problems"

  const level = hierarchy === "Nation" ? "State" : "County"
  const dataURL = hierarchy === "Nation" ? `${tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=Severe+Housing+Problems,Severe+Housing+Problems+CI+Low,Severe+Housing+Problems+CI+High`
                                         : `${tesseract}tesseract/data?cube=county_health_ranking&include=State+County:${id}&drilldowns=County,Year&measures=Severe+Housing+Problems,Severe+Housing+Problems+CI+Low,Severe+Housing+Problems+CI+High&parents=true`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      return data.filter((d: any) => d[measure]);
    },
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => growthPct(d*100),
      },
      color: colorScaleBad,
      scale: "buckets"
    },
  
    groupBy: `${level} ID`,
    label: (d: any) => d[level],
    ocean: hierarchy === "Nation" ? "transparent" : "#D5DADC",
    projection: hierarchy === "Nation" && typeof window !== "undefined" ? albersUsaPr() : "geoMercator",
    tiles: hierarchy === "Nation" ? false : true,
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        [measure, (d: any) => growthPct(d[measure]*100)],
        [`${measure} CI Low`, (d: any) => growthPct(d[`${measure} CI Low`]*100)],
        [`${measure} CI High`, (d: any) => growthPct(d[`${measure} CI High`]*100)]
      ]
    },
    topojson: hierarchy !== "Nation" ? `/topojson/County.json` : `/topojson/State.json`,
    topojsonFilter: hierarchy === "Nation" ? (d: any) => true : (d: any) => countyDataGeoIDs.includes(d.id),
    type: "Geomap"
  }
};

export default viz;
