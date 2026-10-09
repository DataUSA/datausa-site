// Converted from legacy canon_cms_generator #661 "Property Taxes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 661,
  name: "Property Taxes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygmt_mortgage_status_by_real_estate_taxes_5&include=${attrs.hierarchy}:${attrs.id}&measures=Real Estate Taxes by Mortgage,Real Estate Taxes by Mortgage Moe&time=Year.latest&drilldowns=Year`,
  logic: (resp) => {
    const data = resp.data;

    const lastYearPropertyTaxes: any = data[0] ? data[0]["Year"] : false
    const propertyTaxesValue: any = data[0] ? data[0]["Real Estate Taxes by Mortgage"] : false
    const propertyTaxesMoe: any = data[0] ? data[0]["Real Estate Taxes by Mortgage Moe"] : false

    return {
      lastYearPropertyTaxes,
      propertyTaxesValue,
      propertyTaxesMoe
    }
  }
};

export default generator;
