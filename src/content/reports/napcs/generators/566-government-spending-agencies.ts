// Converted from legacy canon_cms_generator #566 "[Government Spending] Agencies" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 566,
  name: "[Government Spending] Agencies",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=usa_spending&drilldowns=Agency,Fiscal+Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Obligation+Amount&time=Fiscal+Year.latest&top=3.Fiscal+Year.Obligation+Amount.desc`,
  logic: (resp) => {
    const returnObj: Record<string, any> = {
      showSpending: resp.data.length > 0,
      obligationYear: resp.data.length > 0 && resp.data[0]["Fiscal Year"]
    };
    resp.data.forEach((d: any, i: any) => {
      returnObj[`agency${i + 1}Name`] = d["Agency"].replace(/\sAgency$/g, "");
      returnObj[`agency${i + 1}Value`] = d["Obligation Amount"];
    });

    return returnObj;
  }
};

export default generator;
