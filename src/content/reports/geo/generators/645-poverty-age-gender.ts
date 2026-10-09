// Converted from legacy canon_cms_generator #645 "Poverty (Age & Gender)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 645,
  name: "Poverty (Age & Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Age,Gender&measures=Poverty+Population&Poverty+Status=0&sort=Poverty+Population.desc`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    return {
      povertyAge1: data[0].Age,
      povertySex1: data[0].Gender,
      povertyAge2: data[1].Age,
      povertySex2: data[1].Gender,
      povertyAge3: data[2].Age,
      povertySex3: data[2].Gender
    }
  }
};

export default generator;
