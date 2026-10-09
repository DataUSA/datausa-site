// Converted from legacy canon_cms_generator #769 "[Operation] Helper Instructional Salaries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 769,
  name: "[Operation] Helper Instructional Salaries",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year&include=University:${attrs.id}&locale=en&measures=Total+Instructional+Employees,Total+Outlays+Instructional+Employees,Median+Total+Instructional+Employees,Median+Outlays+Instructional+Employees`,
  logic: (resp) => {
    const data = resp.data;

    const lengthInstructionalSalaries = data.length;

    return{
      lengthInstructionalSalaries
    }
  }
};

export default generator;
