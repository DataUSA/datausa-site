// Converted from legacy canon_cms_generator #185 "Members Count: Industry Sector" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 185,
  name: "Members Count: Industry Sector",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Industry+Sector&locale=en&measures=Record+Count&time=Year.latest`,
  logic: (resp) => {
    return {
      industriesSectorCount: resp.data.filter((d: any) => d["Industry Sector ID"] !== "").length
    }
  }
};

export default generator;
