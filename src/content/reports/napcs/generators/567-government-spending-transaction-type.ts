// Converted from legacy canon_cms_generator #567 "[Government Spending] Transaction Type" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 567,
  name: "[Government Spending] Transaction Type",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=usa_spending&drilldowns=Transaction+Type,Fiscal+Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Obligation+Amount&time=Fiscal+Year.latest&top=1.Fiscal+Year.Obligation+Amount.desc`,
  logic: (resp) => {
    return {
      transaction: resp.data[0]["Transaction Type"]
    }
  }
};

export default generator;
