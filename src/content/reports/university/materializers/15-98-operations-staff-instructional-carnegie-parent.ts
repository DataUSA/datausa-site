// Converted from legacy canon_cms_materializer #98 "[Operations] Staff (Instructional Carnegie Parent)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 98,
  name: "[Operations] Staff (Instructional Carnegie Parent)",
  ordering: 15,
  allowed: "always",
  logic: (variables) => {
    let dataCurrYear: any;
    const {staffInstructionalDataCP, staffInstructionalDataEmployeesCP, idCarnegieParent} = variables;

    const dataset1 = staffInstructionalDataCP.filter((d: any) => d["Carnegie Parent ID"] === idCarnegieParent)
    const dataset2 = staffInstructionalDataEmployeesCP.filter((d: any) => d["Carnegie Parent ID"] === idCarnegieParent)

    const merged = dataset1.map((d: any) => {
      const item2 = dataset2.find((s: any) => s.Year === d.Year);
      return {
        "Carnegie Parent": d["Carnegie Parent"],
        Year: d.Year,
        "Median Total Instructional Employees": item2 ? item2["Median Total Instructional Employees"] : false,
        "Median Outlays Instructional Employees": item2 ? item2["Median Outlays Instructional Employees"] : false,
        "Median Total Salaries": d["Median Total Salaries"]
      };
    });

    const data = merged.filter((d: any) => d["Median Outlays Instructional Employees"] && d["Median Total Salaries"]);
    if (!data.length) return {staffInstructionalEmployeesCP: false, dataset1, dataset2};

    data.sort((a: any, b: any) => b["Year"] - a["Year"]);
    dataCurrYear = data[0];

    return {
      staffInstructionalNameCarnegie: dataCurrYear["Carnegie Parent"],
      staffInstructionalYearCarnegie: dataCurrYear["Year"],
      staffInstructionalEmployeesCarnegie: dataCurrYear["Median Total Instructional Employees"],
      staffInstructionalSalariesCarnegie: dataCurrYear["Median Outlays Instructional Employees"],
      staffInstructionalShareCarnegie: 100 * dataCurrYear["Median Outlays Instructional Employees"] / dataCurrYear["Median Total Salaries"]
    }
  }
};

export default materializer;
