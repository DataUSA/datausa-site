// Converted from legacy canon_cms_section_visualization #423 "section crimes_and_accidents" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {abbreviate, commas, growthPct} = formatters;
  const {colorScaleBad, countyDataGeoIDs, id, hierarchy, tesseract} = variables;

  const selector = swap("[[socialNeedsSelector]]").replace("socialNeed_opt", "") // socialNeed_opt1: "Violet Crimes", socialNeed_opt2: "Injury Deaths", socialNeed_opt3: "Homicides", socialNeed_opt4: "Firearm Fatalities",
  const factor = 1

  const measure_: any = [
    "Violent Crime",
    "Injury Deaths",
    "Homicides",
    "Firearm Fatalities",
    "Motor Vehicle Crash Deaths"
  ]

  const measure = measure_.at(selector - 1)

  const level = hierarchy === "Nation" ? "State" : "County"
  const dataURL = hierarchy === "Nation" ? `${tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=${measure},${measure} CI Low,${measure} CI High`
                                         : `${tesseract}tesseract/data?cube=county_health_ranking&include=State+County:${id}&drilldowns=County,Year&measures=${measure},${measure} CI Low,${measure} CI High&parents=true`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      return data.filter((d: any) => d[measure]);
    },
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => abbreviate(d),
        title: `${measure} (per 100,000 population)`
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
      tbody: (d: any) => {
        let customTooltip: any = [];
        d[`${measure} CI Low`] ?
          customTooltip = [
            ["Year", d["Year"]],
            [measure, abbreviate(d[measure]*factor)],
            [`${measure} CI Low`, abbreviate(d[`${measure} CI Low`]*factor)],
            [`${measure} CI High`, abbreviate(d[`${measure} CI High`]*factor)]
          ]
          :
          customTooltip = [
            ["Year", d["Year"]],
            [measure, abbreviate(d[measure]*factor)],
          ]
        return customTooltip;
      }
    },
    topojson: hierarchy !== "Nation" ? `/topojson/County.json` : `/topojson/State.json`,
    topojsonFilter: hierarchy === "Nation" ? (d: any) => true : (d: any) => countyDataGeoIDs.includes(d.id),
    type: "Geomap"
  }
};

export default viz;
