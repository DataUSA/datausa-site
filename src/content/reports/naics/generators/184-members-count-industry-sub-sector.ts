// Converted from legacy canon_cms_generator #184 "Members Count: Industry Sub Sector" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 184,
  name: "Members Count: Industry Sub Sector",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Industry+Sub-Sector&locale=en&measures=Record+Count&time=Year.latest`,
  logic: (resp) => {
    return {
      industriesSubSectorCount: resp.data.filter((d: any) => d["Industry Sub-Sector ID"] !== "").length
    }
  }
};

export default generator;
