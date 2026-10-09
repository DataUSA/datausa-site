// Converted from legacy canon_cms_generator #530 "Carnegie Parents (Tuition)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 530,
  name: "Carnegie Parents (Tuition)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Carnegie+Parent%2CYear&locale=en&measures=State+Tuition%2COut+Of+State+Tuition&time=Year.latest`,
  logic: (resp) => {
    const carnegieParents: Record<string, any> = {};

    resp.data.forEach((d: any) => {
      const name = d["Carnegie Parent"];
      carnegieParents[name] = {
        "State Tuition": d["State Tuition"],
        "Out Of State Tuition": d["Out Of State Tuition"],
        "Year": d.Year
      };
    })

    return {
      carnegieParents
    }
  }
};

export default generator;
