// Converted from legacy canon_cms_generator #713 "Degrees (Nation)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 713,
  name: "Degrees (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Degree,Year,Workforce+Status&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&include=Workforce+Status:true&time=Year.latest&sort=Degree.asc`,
  logic: (resp) => {

    return {
      degreeTypes: resp.data
    }
  }
};

export default generator;
