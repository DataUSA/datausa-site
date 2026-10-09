// Converted from legacy canon_cms_generator #665 "Household Income (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 665,
  name: "Household Income (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&measures=Household+Income+by+Race&include=Nation:01000US&time=Year.latest&drilldowns=Year`,
  logic: (resp) => {
    return {
      incomeNation: resp.data[0]["Household Income by Race"]
    };
  }
};

export default generator;
