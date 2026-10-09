// Converted from legacy canon_cms_generator #628 "[Education] Degrees by population" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 628,
  name: "[Education] Degrees by population",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,State,Group&measures=Total+Population&parents=false&time=Year.latest`,
  logic: (resp) => {
    const dataDegrees = resp.data

    dataDegrees.forEach((d: any) => {
      delete d["State"]
      delete d["Slug State"]
    })

    return{
      dataDegrees
    }


  }
};

export default generator;
