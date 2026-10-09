// Converted from legacy canon_cms_generator #484 "Carnegie Parents (Retention)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 484,
  name: "Carnegie Parents (Retention)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&drilldowns=Year%2CCarnegie+Parent&time=Year.latest&locale=en&measures=Full+Time+Retention+Rate`,
  logic: (resp) => {
    return {
      carnegieParentsRetentionRateList: resp.data
    }
  }
};

export default generator;
