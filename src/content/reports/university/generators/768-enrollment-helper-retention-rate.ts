// Converted from legacy canon_cms_generator #768 "[Enrollment] Helper Retention Rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 768,
  name: "[Enrollment] Helper Retention Rate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&locale=en&measures=Full+Time+Retention+Rate`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Full Time Retention Rate"] !== null);

    const lengthRetentionRate = data.length;

    return{
      lengthRetentionRate
    }
  }
};

export default generator;
