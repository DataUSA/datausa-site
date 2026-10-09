// Converted from legacy canon_cms_generator #737 "Foreign-Born (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 737,
  name: "Foreign-Born (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygf_place_of_birth_for_foreign_born_5&measures=Foreign-Born Citizens&include=Nation:01000US&drilldowns=Year&time=Year.latest`,
  logic: (resp) => {
    const foreign = resp.data[0]["Foreign-Born Citizens"];


    return {
      foreign
    };

  }
};

export default generator;
