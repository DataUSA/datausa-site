// Converted from legacy canon_cms_section_visualization #429 "section clinical-care" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {abbreviate, commas, growthPct} = formatters;
  const {colorScaleBad, countyDataGeoIDs, id, hierarchy, tesseract} = variables;

  const mainSelector = swap("[[clinicalCareOptions]]") //accessCareOption, accessQualityOption

  const selector = mainSelector === "accessCareOption" ? swap("[[accessCareOptions]]").replace("indicator_", "") : swap("[[qualityCareOptions]]").replace("indicator_", "")

  const measure_: any = [
    "Uninsured",
    "Uninsured Adults",
    "Uninsured Children",
    "Other Primary Care Providers",
    "Patient to Dentist Ratio",
    "Patient to Primary Care Physician Ratio",
    "Patient to Mental Health Provider Ratio",
    "Preventable Hospital Stays",
    "Mammography Screening"
  ]

  const titleOption: any = [
   "Percentage of population under age 65 without health insurance",
   "Percentage of adults under age 65 without health insurance",
   "Percentage of children under age 19 without health insurance",
   "Ratio of population to primary care providers other than physicians",
   "Ratio of population to dentists",
   "Ratio of population to primary care physicians",
   "Ratio of population to mental health providers",
   "Rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees",
   "Percentage of female Medicare enrollees ages 65-74 that received an annual mammography screening"
  ]

  const factor_: any = [100, 100, 100, 1, 1, 1, 1, 1, 100]

  const measure = measure_.at(selector - 1)
  const title = titleOption.at(selector - 1)
  const factor = factor_.at(selector - 1)
  const formatter = factor === 1 ? abbreviate : growthPct

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
        tickFormat: (d: any) => formatter(d*factor),
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
            [measure, formatter(d[measure]*factor)],
            [`${measure} CI Low`, formatter(d[`${measure} CI Low`]*factor)],
            [`${measure} CI High`, formatter(d[`${measure} CI High`]*factor)]
          ] :
          customTooltip = [
            ["Year", d["Year"]],
            [measure, formatter(d[measure]*factor)],
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
