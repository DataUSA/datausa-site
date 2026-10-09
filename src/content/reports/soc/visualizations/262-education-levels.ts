// Converted from legacy canon_cms_section_visualization #262 "section education-levels" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {hierarchy, id, iconGender} = variables;
  const {abbreviate, salary, commas} = formatters;

  const selector = swap("[[education-levels]]") // workforceEL, wageEL
  const measure = selector === "workforceEL" ? "Total Population" : "Average Wage"
  const measureMOE = selector === "workforceEL" ? "Total Population MOE Appx" : "Average Wage Appx MOE"

  return {
    data: `/api/data?drilldowns=Year,Group,Gender&measures=${measure},${measureMOE}&Workforce Status=true&${variables.hierarchy}=${variables.id}`,
    groupBy: [
      "ID Gender"
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
