// Converted from legacy canon_cms_generator #651 "Households" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 651,
  name: "Households",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_household_income_5&include=${attrs.hierarchy}:${attrs.id}&measures=Household+Income,Household+Income+Moe&drilldowns=Year`,
  logic: (resp, {libs}) => {
    const measure: string = "Household Income";

    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    return {
      households: data[0] ? data[0][measure]: false,
      householdsMoe: data[0] ? data[0][`${measure} Moe`] : false
    }
  }
};

export default generator;
