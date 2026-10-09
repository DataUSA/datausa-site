// Converted from legacy canon_cms_generator #464 "[Sex Imbalance for Common Institutions] Graduates (Gender)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 464,
  name: "[Sex Imbalance for Common Institutions] Graduates (Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Gender,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear: any = resp.data[0] ? max(resp.data, (d: any) => d["Year"]) : false;
    const data: any = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : false;

    if (data) {
      const male = data.find((d: any) => d.Gender === "Men");
      const female = data.find((d: any) => d.Gender === "Women");

      const totalCompletions = male.Completions + female.Completions;

      return {
        gradsFemale: female.Completions,
        gradsMale: male.Completions,
        gradsGenderRatio: male.Completions / female.Completions,
        gradsGenderDiff: male.Completions - female.Completions,
        gradsGenderTop: totalCompletions === 0 ? false : male.Completions > female.Completions ? "Male" : "Female",
        gradsGenderTopRatio: totalCompletions === 0 ? false :  male.Completions > female.Completions ? (male.Completions / totalCompletions) * 100 : (female.Completions / totalCompletions) * 100,
        gradsGenderYear: male.Year
      }
    } else {
      return {
        gradsFemale: false,
        gradsMale: false,
        gradsGenderRatio: false,
        gradsGenderDiff: false,
        gradsGenderTop:  false,
        gradsGenderTopRatio: false,
        gradsGenderYear: false
      }
    }
  }
};

export default generator;
