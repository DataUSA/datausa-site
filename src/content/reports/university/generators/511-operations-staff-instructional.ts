// Converted from legacy canon_cms_generator #511 "[Operations] Staff (Instructional)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 511,
  name: "[Operations] Staff (Instructional)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp) => {
    const data = resp.data;

    if(data.length > 0){

      data.sort((a: any, b: any) => b["Year"] - a["Year"]);
  
      return {
        staffInstructionalDataEmployees: data,
      }
    }
    else{
      return {
        staffInstructionalDataEmployees: false,
      }
    }
  }
};

export default generator;
