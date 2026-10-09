// Converted from legacy canon_cms_generator #25 "Degrees (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 25,
  name: "Degrees (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=ipeds_completions&measures=Completions&drilldowns=Degree&sort=Degree.asc&time=Year.latest&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp) => {
    return {
      degreeTypes: resp.data[0] ? resp.data : false
    }
  }
};

export default generator;
