// Converted from legacy canon_cms_generator #507 "Cost University Tuition + Books & Supplies" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 507,
  name: "Cost University Tuition + Books & Supplies",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,University&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Out+Of+State+Tuition%2CBooks+And+Supplies`,
  logic: (resp) => {
    const hierarchy: string = "University"

    const data = resp.data.reduce((obj: any, d: any) => {
      if (!obj[`${d["Year"]}_${d[`${hierarchy} ID`]}`]) obj[`${d["Year"]}_${d[`${hierarchy} ID`]}`] = d["Books And Supplies"] + d["Out Of State Tuition"]; 
      return obj;
    }, {})
    return {
      costUniversityTuition: data
    }
  }
};

export default generator;
