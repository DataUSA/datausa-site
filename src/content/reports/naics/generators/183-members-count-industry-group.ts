// Converted from legacy canon_cms_generator #183 "Members Count: Industry Group" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 183,
  name: "Members Count: Industry Group",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Industry+Group&locale=en&measures=Record+Count&time=Year.latest`,
  logic: (resp) => {
    // /api/data?drilldowns=Industry%20Group&measure=Record%20Count&year=latest

    return {
      industriesGroupCount: resp.data.filter((d: any) => d["Industry Group ID"] !== "").length
    }
  }
};

export default generator;
