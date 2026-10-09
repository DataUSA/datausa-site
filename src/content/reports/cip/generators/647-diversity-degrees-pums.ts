// Converted from legacy canon_cms_generator #647 "[Diversity] Degrees (PUMS)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 647,
  name: "[Diversity] Degrees (PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CDegree&include=CIP2:${attrs.cip2};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&time=Year.latest&top=3.Year.Total+Population.desc&filters=Record+Count.gte.5`,
  logic: (resp) => {
    return {
      degreeMostCommonTop3PUMS: resp.data.length ? resp.data.slice(0, 3).map((d: any) => d["Degree"]) : false
    }
  }
};

export default generator;
