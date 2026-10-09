// Converted from legacy canon_cms_generator #514 "[Operations] Staff (Instructional Carnegie Parent)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 514,
  name: "[Operations] Staff (Instructional Carnegie Parent)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Total+Instructional+Employees,Median+Outlays+Instructional+Employees`,
  logic: (resp) => {
    const data = resp.data 

    // .filter((d: any) => d["Total Outlays Instructional Employees"]);
    // if (!data.length) return {staffInstructionalEmployees: false};

    data.sort((a: any, b: any) => b["Year"] - a["Year"]);
    // dataCurrYear = data[0];

    return {
      staffInstructionalDataEmployeesCP: data,
      // staffInstructionalYear: dataCurrYear["Year"],
      // staffInstructionalEmployees: dataCurrYear["Total Instructional Employees"],
      // staffInstructionalSalaries: dataCurrYear["Total Outlays Instructional Employees"],
    }
  }
};

export default generator;
