// Converted from legacy canon_cms_generator #635 "[Population] Population in State" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 635,
  name: "[Population] Population in State",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=State,Gender&measures=Total+Population&time=Year.latest`,
  logic: (resp) => {
    const dataResidentsByGender = resp.data;

    dataResidentsByGender.forEach((d: any) => {
      delete d["Gender"]
      delete d["Slug State"]
    })

    return{
      dataResidentsByGender
    }


  }
};

export default generator;
