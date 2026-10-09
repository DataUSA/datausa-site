// Converted from legacy canon_cms_section_visualization #215 "section health_behaviors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {id} = variables;
  const {growthPct, abbreviate} = formatters;

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

  const dataURL: string = `/api/data?drilldowns=Year&measures=${measure},${measure} CI Low,${measure} CI High&Geography=${variables.id}`

  return {
    data: dataURL,
    confidence: [
      (d: any) => d[`${measure} CI Low`], 
      (d: any) => d[`${measure} CI High`], 
     ],
    confidenceConfig: {
        fillOpacity: 0.5,
    },
    groupBy: [
      "ID Geography"
    ],
    height: 250,
    label: (d: any) => String(d["Geography"]),
    title: title,
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
    type: "LinePlot",
    x: "Year",
    xConfig: {
      title: ""
    },
    y: measure,
    yConfig: {
      title: measure,
      tickFormat: (d: any) => formatter(d*factor)
    }
  };

};

export default viz;
