// Converted from legacy canon_cms_generator #764 "[Payroll] By Industry (Growth)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 764,
  name: "[Payroll] By Industry (Growth)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Annual+Payroll`,
  logic: (resp) => {
    const data = resp.data;

    return{
      lenPayroll: data.length
    }
  }
};

export default generator;
