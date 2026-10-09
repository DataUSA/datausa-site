// Converted from legacy canon_cms_generator #745 "Degrees (Nation)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 745,
  name: "Degrees (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree&locale=en&measures=Completions`,
  logic: (resp) => {
    const data = resp.data.sort((a: any, b: any) => a["Degree ID"] - b["Degree ID"])


    return {
      degreeTypes: data
    }
  }
};

export default generator;
