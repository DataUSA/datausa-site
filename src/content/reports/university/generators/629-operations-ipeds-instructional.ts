// Converted from legacy canon_cms_generator #629 "[Operations] IPEDS Instructional" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 629,
  name: "[Operations] IPEDS Instructional",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Academic+Rank,Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Instructional+Employees`,
  logic: (resp) => {
    const data = resp.data;

    if(data.length > 0){
      return {
        instructionalEmployees: resp.data
      }
    }
    else{
      return {
        instructionalEmployees: []
      }
    }
  }
};

export default generator;
