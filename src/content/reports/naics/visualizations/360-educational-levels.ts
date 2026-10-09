// Converted from legacy canon_cms_section_visualization #360 "section educational_levels" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, swap}) => {
  const {hierarchy, id, tesseract} = variables;
  const {commas, abbreviate, salary, dollar} = formatters;

  const level: Record<string, any> = {
    "No Schooling":	1,
    "Preschool":	2,
    "Primary Education":	3,
    "Secondary Education":	4,
    "High School or Equivalent":	5,
    "Some college":	6,
    "Associates Degree":	7,
    "Bachelors Degree":	8,
    "Graduate Degree":	9
  }

  const selector = swap("[[educationWorkforceWage]]") // workforce, wage
  const measure = selector === "workforce" ? "Total Population" : "Average Wage"

  const formatter = selector === "workforce" ? commas : salary

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Group,Gender&include=${hierarchy}:${id};Workforce+Status:true&locale=en&measures=${measure}`

  return {
   // data: `/api/data?drilldowns=Group,Year,Gender&measures=${measure}&${hierarchy}=${id}&Workforce Status=true`,
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => Object.assign({}, d));
    
        data.forEach((d: any) => {
          d["ID"] = level[d["Group"]]
          d.Sex = d.Gender
          d["Sex ID"] = d["Gender ID"]
          delete d.Gender
          delete d["Gender ID"]
        });
      return data;
    },
    groupBy: ["Sex ID"],
    label: (d: any) => String(d["Sex"]),
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d["Year"]],
        [`${measure}`, (d: any) => formatter(d[measure])]
      ]
    },
    type: "BarChart",
    x: "Group",
    xConfig: {
      title: ""
    },
    xSort: (a: any, b: any) => a["ID"] - b["ID"],
    y: measure,
    yConfig: {
      title: `${measure}`,
      tickFormat: selector === "workforce" ? (d: any) => abbreviate(d) : (d: any) => salary(d)
    }
  };
};

export default viz;
