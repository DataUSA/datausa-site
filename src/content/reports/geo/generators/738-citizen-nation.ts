// Converted from legacy canon_cms_generator #738 "Citizen (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 738,
  name: "Citizen (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygc_citizenship_status_5&measures=Citizenship+Status&include=Nation:01000US&drilldowns=Year&time=Year.latest`,
  logic: (resp) => {
    const totalCitizen = resp.data[0]["Citizenship Status"];


    return {
      totalCitizen
    };

  }
};

export default generator;
