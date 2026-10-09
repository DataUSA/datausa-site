// Converted from legacy canon_cms_section_visualization #213 "section health_outcomes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {abbreviate, commas, growthPct} = formatters;
  const {colorScaleBad, countyDataGeoIDs, id, hierarchy} = variables;

  const mainSelector = swap("[[healthOutcomesOptions]]") //lengthOfLife, qualityOfLife

  const selector = mainSelector === "lengthOfLife" ? swap("[[lengthOfLife]]").replace("indicator_", "") : swap("[[qualityOfLife]]").replace("indicator_", "")

  const measure_: any = [
    "Child Mortality",
    "Infant Mortality",
    "Premature Death",
    "Premature Age-Adjusted Mortality",
    "Low Birthweight",
    "Poor Physical Health Days",
    "Poor Mental Health Days",
    "Poor Or Fair Health",
    "Frequent Physical Distress",
    "Frequent Mental Distress",
    "Diabetes Prevalence",
    "Hiv Prevalence"
  ]

  const titleOption: any = [
    "Number of deaths among residents under age 18 per 100,000 population",
    "Number of infant deaths (within 1 year) per 1,000 live births",
    "Years of potential life lost before age 75 per 100,000 population (age-adjusted)",
    "Number of deaths among residents under age 75 per 100,000 population (age-adjusted)",
    "Percentage of live births with low birthweight (< 2,500 grams)",
    "Average number of physically unhealthy days reported in past 30 days (age-adjusted)",
    "Average number of mentally unhealthy days reported in past 30 days (age-adjusted)",
    "Percentage of adults reporting fair or poor health (age-adjusted)",
    "Percentage of adults reporting 14 or more days of poor physical health per month (age-adjusted)",
    "Percentage of adults reporting 14 or more days of poor mental health per month (age-adjusted)",
    "Percentage of adults aged 20 and above with diagnosed diabetes (age-adjusted)",
    "Number of people aged 13 years and older living with a diagnosis of human immunodeficiency virus (HIV) infection per 100,000 population"
  ]

  const factor_: any = [1, 1, 1, 1, 100, 1, 1, 100, 100, 100, 100, 1]

  const measure = measure_.at(selector - 1)
  const title = titleOption.at(selector - 1)
  const factor = factor_.at(selector - 1)
  const formatter = factor === 1 ? abbreviate : growthPct

  const level = hierarchy === "Nation" ? "State" : "County"
  const dataURL = hierarchy === "Nation" ? `/api/data?drilldowns=State,Year&measures=${measure},${measure} CI Low,${measure} CI High`
                                         : `/api/data?drilldowns=County,Year&measures=${measure},${measure} CI Low,${measure} CI High&parents=true`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      if(hierarchy === "Nation"){
        return data
      }
      else{
       return data.filter((d: any) => d["ID State"] === id)
      }
    },
    colorScale: measure,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => formatter(d*factor),
      },
      color: colorScaleBad,
      scale: "buckets"
    },
  
    groupBy: `ID ${level}`,
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
          ]
          :
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
