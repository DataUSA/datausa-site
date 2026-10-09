// Converted from legacy canon_cms_section_visualization #385 "section education-levels" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {hierarchy, id, iconGender, tesseract} = variables;
  const {abbreviate, salary, commas} = formatters;

  const selector = swap("[[education-levels]]") // workforceEL, wageEL
  const measure = selector === "workforceEL" ? "Total Population" : "Average Wage"
  const measureMOE = selector === "workforceEL" ? "Total Population MOE Appx" : "Average Wage Appx MOE"

  const data: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Group,Year,Gender&include=${hierarchy}:${id};Workforce+Status%3Atrue&locale=en&measures=${measure},${measureMOE}`

  return {
    data: data,
    groupBy: [
      "Gender ID"
    ],
    label: selector === "workforceEL" ? (d: any) => commas(d[measure]) : (d: any) => salary(d[measure]),
    tooltipConfig: {
      tbody: [
        [ "Education Level", (d: any) => d["Group"] ],
        [ "Gender", (d: any) => d["Gender"] ],
        [ measure, selector === "workforceEL" ? (d: any) => commas(d[measure]) : (d: any) => salary(d[measure]) ]
      ]
    },
    type: "BarChart",
   legend: true,
   legendConfig: {
      label: (d: any) => d.Gender,
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d["Gender"]]
      }
    },
    legendTooltip: {
      tbody: [],
    },
    time: "Year",
    timeline: true,
    x: "Group",
    xConfig: {
      title: "Group"
    },
    y: measure,
    yConfig: {
      title: selector === "workforceEL" ? "Workforce" : `${measure}`,
      tickFormat: selector === "workforceEL" ? (d: any) => commas(d) : (d: any) => salary(d)
    }
  };
};

export default viz;
