// Converted from legacy canon_cms_generator #69 "Poverty (Race)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 69,
  name: "Poverty (Race)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Race&measures=Poverty+Population,Poverty+Population+Moe&time=Year.latest&Poverty+Status=0&sort=Poverty+Population.desc`,
  logic: (resp) => {
    const measure: string = "Poverty Population";

    const data = resp.data.filter((d: any) => d["Race ID"] !== 0 && d["Race ID"] !== 8);

    const one = data.length >= 1;
    const two = data.length >= 2;
    const three = data.length >= 3;

    return {
      racePoverty1Name: one && data[0].Race,
      racePoverty1Pop: one && data[0][measure],
      racePoverty1MOE: one && data[0][`${measure} Moe`],
      racePoverty2Name: two && data[1].Race,
      racePoverty2Pop: two && data[1][measure],
      racePoverty2MOE: two && data[1][`${measure} Moe`],
      racePoverty3Name: three && data[2].Race,
      racePoverty3Pop: three && data[2][measure],
      racePoverty3MOE: three && data[2][`${measure} Moe`]
    }
  }
};

export default generator;
