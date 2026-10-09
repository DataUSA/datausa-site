// Converted from legacy canon_cms_section_visualization #428 "section clinical-care" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {id, hierarchy, tesseract, len_indicator_1, len_indicator_2, len_indicator_3, len_indicator_4,
    len_indicator_5, len_indicator_6, len_indicator_7, len_indicator_8, len_indicator_9} = variables;
  const {growthPct, abbreviate} = formatters;

  const mainSelector = swap("[[clinicalCareOptions]]") //accessCareOption, accessQualityOption

  const selector = mainSelector === "accessCareOption" ? swap("[[accessCareOptions]]").replace("indicator_", "") : swap("[[qualityCareOptions]]").replace("indicator_", "")

  const lenList: Record<string, any> = {
    "1": len_indicator_1,
    "2": len_indicator_2,
    "3": len_indicator_3,
    "4": len_indicator_4,
    "5": len_indicator_5,
    "6": len_indicator_6,
    "7": len_indicator_7,
    "8": len_indicator_8,
    "9": len_indicator_9,
  };

  const lenData = lenList[selector];

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

  if(lenData > 1){
    return {
      data: `${tesseract}tesseract/data?cube=county_health_ranking&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year&measures=${measure},${measure} CI Low,${measure} CI High`,
      dataFormat: (resp: any) => {
        const data = resp.data;
        return data.filter((d: any) => d[measure]);
      },
      confidence: [
        (d: any) => d[`${measure} CI Low`], 
        (d: any) => d[`${measure} CI High`], 
       ],
      confidenceConfig: {
          fillOpacity: 0.5,
      },
      groupBy: [`${hierarchy} ID`],
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
    }
  }
  else{
    return {
      data: `${tesseract}tesseract/data?cube=county_health_ranking&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year&measures=${measure},${measure} CI Low,${measure} CI High`,
      dataFormat: (resp: any) => {
        const data = resp.data;
        return data.filter((d: any) => d[measure]);
      },
      groupBy: [`${hierarchy} ID`],
      height: 250,
      label: (d: any) => String(d[hierarchy]),
      shapeConfig: {
        width: 200
      },
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
      type: "BarChart",
      x: "Year",
      xConfig: {
        title: ""
      },
      y: measure,
      yConfig: {
        title: measure,
        tickFormat: (d: any) => formatter(d*factor)
      }
    }
  }
};

export default viz;
