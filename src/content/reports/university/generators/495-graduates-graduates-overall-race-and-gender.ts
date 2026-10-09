// Converted from legacy canon_cms_generator #495 "[Graduates] Graduates Overall (Race and Gender)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 495,
  name: "[Graduates] Graduates Overall (Race and Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year,Gender,IPEDS+Race&locale=en&measures=Graduation+Rate&sort=Graduation+Rate.desc&time=Year.latest`,
  logic: (resp) => {
    return {
      gradsOverallTop1Name: `${resp.data[0]["IPEDS Race"]} ${resp.data[0]["Gender"] == "Women" ? "Female" : "Male"}`,
      gradsOverallTop1Percent: resp.data[0]["Graduation Rate"] * 100
    }

  }
};

export default generator;
