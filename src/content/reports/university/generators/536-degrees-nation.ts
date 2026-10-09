// Converted from legacy canon_cms_generator #536 "Degrees (Nation)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 536,
  name: "Degrees (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree&locale=en&measures=Completions&exclude=Degree:20,21`,
  logic: (resp) => {

    return {
      degreeTypes: resp.data
    }
  }
};

export default generator;
