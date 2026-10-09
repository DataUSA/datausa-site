// Converted from legacy canon_cms_generator #505 "[Stats] Graduation Rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 505,
  name: "[Stats] Graduation Rate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Number+Of+Finishers%2CGraduation+Rate&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data;

    if (data.length > 0){
      return {
        gradRateYearCurr: data[0]["Year"],
        gradRatePercent: data[0]["Graduation Rate"] * 100,
        gradRateCount: data[0]["Number Of Finishers"]
      }
    }
    else{
      return{
        gradRateYearCurr: false
      }
    }
  }
};

export default generator;
