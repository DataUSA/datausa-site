// Converted from legacy canon_cms_materializer #97 "[Operations] Staff (Instructional)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 97,
  name: "[Operations] Staff (Instructional)",
  ordering: 14,
  allowed: "always",
  logic: (variables) => {
    let dataCurrYear: any;
    const {staffInstructionalData, staffInstructionalDataEmployees} = variables;

    const merged = staffInstructionalData.map((d: any) => {
      const item2 = (staffInstructionalDataEmployees || [])
        .find((s: any) => s.Year === d.Year);

      return {
        Year: d.Year,
        "Total Instructional Employees": item2
          ? item2["Total Instructional Employees"]
          : false,

        "Total Outlays Instructional Employees": item2
          ? item2["Total Outlays Instructional Employees"]
          : false,

        "Total Salaries": d["Total Salaries"]
      };
    });

    const data = merged.filter((d: any) => d["Total Outlays Instructional Employees"] && d["Total Salaries"]);
    data.sort((a: any, b: any) => b["Year"] - a["Year"]);

    if(data.length > 0){
  
      dataCurrYear = data[0];
  
      return {
        staffInstructionalYear: dataCurrYear["Year"],
        staffInstructionalEmployees: dataCurrYear["Total Instructional Employees"],
        staffInstructionalSalaries: dataCurrYear["Total Outlays Instructional Employees"],
        staffInstructionalShare: 100 * dataCurrYear["Total Outlays Instructional Employees"] / dataCurrYear["Total Salaries"]
      }
    }
    else{
      return{
        staffInstructionalYear: false,
        staffInstructionalEmployees: false
      }
    }
  }
};

export default materializer;
