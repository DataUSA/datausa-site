// Converted from legacy canon_cms_generator #565 "[Government Spending] Obligation" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 565,
  name: "[Government Spending] Obligation",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=usa_spending&drilldowns=${attrs.hierarchy},Fiscal+Year&locale=en&measures=Obligation+Amount&time=Fiscal+Year.latest&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp) => {
    return {
      obligationValue: resp.data.length > 0 && resp.data[0]["Obligation Amount"],
    }
  }
};

export default generator;
