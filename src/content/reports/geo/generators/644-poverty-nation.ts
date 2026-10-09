// Converted from legacy canon_cms_generator #644 "Poverty (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 644,
  name: "Poverty (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&drilldowns=Poverty+Status&measures=Poverty+Population&include=Nation:01000US&time=Year.latest`,
  logic: (resp) => {
    const measure: string = "Poverty Population";

    const below = resp.data.filter((d: any) => d["Poverty Status ID"] === 0);
    const above = resp.data.filter((d: any) => d["Poverty Status ID"] === 1);

    const currPoverty = below[0][measure];

    const currTotal = currPoverty + above[0][measure];

    return {
      povertyRateUS: currPoverty / currTotal * 100
    }
  }
};

export default generator;
