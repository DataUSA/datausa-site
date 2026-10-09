// Converted from legacy canon_cms_generator #662 "Property Tax (Bucket)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 662,
  name: "Property Tax (Bucket)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygmt_mortgage_status_by_real_estate_taxes_5&include=${attrs.hierarchy}:${attrs.id}&measures=Real+Estate+Taxes+by+Mortgage&drilldowns=Year,Real+Estate+Taxes+Paid&sort=Real+Estate+Taxes+by+Mortgage.desc&time=Year.latest`,
  logic: (resp) => {
    return {
      propertyBucket_propertyTaxes: resp.data[0]["Real Estate Taxes Paid"]
    }
  }
};

export default generator;
