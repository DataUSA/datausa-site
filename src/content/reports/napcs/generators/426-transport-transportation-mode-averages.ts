// Converted from legacy canon_cms_generator #426 "[Transport] Transportation Mode (Averages)" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 426,
  name: "[Transport] Transportation Mode (Averages)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=dot_faf&measures=Thousands%20Of%20Tons&drilldowns=Year,Transportation%20Mode`,
  logic: (resp) => {
    const data = resp.data.sort((a: any, b: any) => b["Year"] - a["Year"])

    return {
      transportAvg: data
    }
  }
};

export default generator;
