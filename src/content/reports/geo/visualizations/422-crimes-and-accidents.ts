// Converted from legacy canon_cms_section_visualization #422 "section crimes_and_accidents" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {id, tesseract, hierarchy, len_socialNeed_opt1, len_socialNeed_opt2, len_socialNeed_opt3, len_socialNeed_opt4, len_socialNeed_opt5} = variables;
  const {abbreviate} = formatters;

  const selector = swap("[[socialNeedsSelector]]").replace("socialNeed_opt", "") // socialNeed_opt1: "Violet Crimes", socialNeed_opt2: "Injury Deaths", socialNeed_opt3: "Homicides", socialNeed_opt4: "Firearm Fatalities",

  const measure_: any = [
    "Violent Crime",
    "Injury Deaths",
    "Homicides",
    "Firearm Fatalities",
    "Motor Vehicle Crash Deaths"
  ]

  const measure = measure_.at(selector - 1)

  const lenVariables: Record<string, any> = {
    "1": len_socialNeed_opt1,
    "2": len_socialNeed_opt2,
    "3": len_socialNeed_opt3,
    "4": len_socialNeed_opt4,
    "5": len_socialNeed_opt5
  };

  const lenData = lenVariables[selector];

  const factor = 1;

  const dataURL: string = `${tesseract}tesseract/data?cube=county_health_ranking&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year&measures=${measure},${measure} CI Low,${measure} CI High`

  if(lenData > 1){
    return {
      data: dataURL,
      dataFormat: (resp: any) => {
        const data = resp.data;
        return data.filter((d: any) => d[measure]);
      },
      confidence: [
        (d: any) => d[`${measure} CI Low`], 
        (d: any) => d[`${measure} CI High`], 
       ],
      confidenceConfig: {
          fillOpacity: 0.3,
      },
      groupBy: [`${hierarchy} ID`],
      height: 250,
      label: (d: any) => String(d[hierarchy]),
      tooltipConfig: {
        tbody: (d: any) => {
          let customTooltip: any = [];
          d[`${measure} CI Low`] ?
            customTooltip = [
              ["Year", d["Year"]],
              [measure, abbreviate(d[measure]*factor)],
              [`${measure} CI Low`, abbreviate(d[`${measure} CI Low`]*factor)],
              [`${measure} CI High`, abbreviate(d[`${measure} CI High`]*factor)]
            ] :
            customTooltip = [
              ["Year", d["Year"]],
              [measure, abbreviate(d[measure]*factor)],
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
        title: `${measure} (per 100,000 population)`,
        tickFormat: (d: any) => abbreviate(d)
      }
    }
  }
  else{
    return {
      data: dataURL,
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
      tooltipConfig: {
        tbody: (d: any) => {
          let customTooltip: any = [];
          d[`${measure} CI Low`] ?
            customTooltip = [
              ["Year", d["Year"]],
              [measure, abbreviate(d[measure]*factor)],
              [`${measure} CI Low`, abbreviate(d[`${measure} CI Low`]*factor)],
              [`${measure} CI High`, abbreviate(d[`${measure} CI High`]*factor)]
            ] :
            customTooltip = [
              ["Year", d["Year"]],
              [measure, abbreviate(d[measure]*factor)],
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
        title: `${measure} (per 100,000 population)`,
        tickFormat: (d: any) => abbreviate(d)
      }
    }
  }
};

export default viz;
