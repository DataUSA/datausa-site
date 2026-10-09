// Converted from legacy canon_cms_section_visualization #216 "section health_behaviors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap, albersUsaPr}) => {
  const {abbreviate, commas, growthPct} = formatters;
  const {colorScaleBad, countyDataGeoIDs, id, hierarchy} = variables;

  const mainSelector = swap("[[healthBehaviorsOptions]]") //dietAndExerciseOption, alcoholDrugsTobaccoOption

  const selector = mainSelector === "dietAndExerciseOption" ? swap("[[dietAndExerciseOptions]]").replace("indicator_", "") : swap("[[alcoholDrugsTobaccoOptions]]").replace("indicator_", "")

  const measure_: any = [
    "Adult Obesity",
    "Access To Exercise Opportunities",
    "Food Environment Index",
    "Food Insecurity",
    "Limited Access To Healthy Foods",
    "Physical Inactivity",
    "Adult Smoking",
    "Drug Overdose Deaths",
    "Excessive Drinking",
    "Alcohol-Impaired Driving Deaths"
  ]

  const titleOption: any = [
    "Percentage of the adult population that reports a body mass index ≥ 30 kg/m2",
    "Percentage of population with adequate access to locations for physical activity",
    "Index of factors that contribute to a healthy food environment",
    "Percentage of population who lack adequate access to food",
    "Percentage of population who are low-income and do not live close to a grocery store",
    "Percentage of adults age 18 and over reporting no leisure-time physical activity",
    "Percentage of adults who are current smokers",
    "Number of drug poisoning deaths per 100,000 population",
    "Percentage of adults reporting binge or heavy drinking",
    "Percentage of driving deaths with alcohol involvement"
  ]

  const factor_: any = [100, 100, 1, 100, 100, 100, 100, 1, 100, 100]

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
