// Converted from legacy canon_cms_generator #652 "Households (Buckets)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 652,
  name: "Households (Buckets)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_household_income_5&include=${attrs.hierarchy}:${attrs.id}&measures=Household+Income&drilldowns=Year,Household+Income+Bucket&time=Year.latest&sort=Household+Income.desc&limit=1`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    return {
      householdIncomeBucket: data[0]["Household Income Bucket"]
    }
  }
};

export default generator;
