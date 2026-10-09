// Converted from legacy canon_cms_section_visualization #240 "section employment-over-time" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, colorGrey, hierarchy, id, iconGender, mostSimilarOccup} = variables;
  const {commas, abbreviate, salary} = formatters;

  const options = swap("[[employment-measures]]") // workforceEOT, avgWageEOT
  const optionName = swap("{{[[employment-measures]]}}") // Workforce, Average Wage

  const filter = swap("[[employment-ot-filter]]") // simOccupationsEOT, genderEOT
  const filterName = swap("{{[[employment-ot-filter]]}}") // Similar Occupations, Gender


  const measure = options === "workforceEOT" ? "Total Population" : "Average Wage";
  const measureMOE = options === "workforceEOT" ? "Total Population MOE Appx" : "Average Wage Appx MOE";

  if(filter == "genderEOT"){

  let dataURL: any = `/api/data?drilldowns=Year,Gender&measures=${measure},${measureMOE}&Workforce Status=true&Nation=01000US&${hierarchy}=${id}&Record Count>=5`

  return {
    baseline: 0,
   data: dataURL,
   groupBy: ["ID Gender"],
   label: (d: any) => d["Gender"],
   legend: true,
   lienLabels: true,
   legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]]
      },
    },
    legendTooltip: {
      tbody: [],
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        [optionName, optionName === "Average Wage" ? (d: any) => salary(d[measure]) : (d: any) => commas(d[measure])],
        ["Margin of Error", optionName === "Average Wage" ? (d: any) => `± ${salary(d[measureMOE])}` : (d: any) => `± ${commas(d[measureMOE])}`]
      ]
    },
    type: "LinePlot",
    x: "Year",
    xConfig: {
      title: "Year"
    },
    y: measure,
    yConfig: {
      title: measure === "Total Population" ? "Population" : "Wage",
      tickFormat: (d: any) => measure === "Total Population" ? abbreviate(d) : salary(d)
    }
   }
  }

  else{
  
  const measureURL = options === "workforceEOT" ? "Total Population,Total Population MOE Appx" : "Average Wage,Average Wage Appx MOE"
  const similarIds = mostSimilarOccup.map((d: any) => d[`ID ${hierarchy}`]).join(',');
  let dataURL: any = `/api/data?drilldowns=Year,${hierarchy}&measures=${measureURL}&Workforce Status=true&Nation=01000US&${hierarchy}=${similarIds}&Record Count>=5`

  return {
    baseline: 0,
   data: dataURL,
   groupBy: [`ID ${hierarchy}`],
   label: (d: any) => d[hierarchy],
   legend: false,
   lineLabels: true,
   shapeConfig: {
     Line: {
       stroke: (d: any) => d[`ID ${hierarchy}`] === id ? colorHighlight : colorGrey
     }
   },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        [optionName, optionName === "Average Wage" ? (d: any) => salary(d[measure]) : (d: any) => commas(d[measure])],
        ["Margin of Error", optionName === "Average Wage" ? (d: any) => `± ${salary(d[measureMOE])}` : (d: any) => `± ${commas(d[measureMOE])}`]
      ]
    },
    type: "LinePlot",
    x: "Year",
    xConfig: {
      title: "Year"
    },
    y: measure,
    yConfig: {
      title: measure === "Total Population" ? "Population" : "Wage",
      tickFormat: (d: any) => measure === "Total Population" ? abbreviate(d) : salary(d)
    }
   }
  
  }
};

export default viz;
