// Converted from legacy canon_cms_generator #473 "[Costs] Tuition (In & Out of State)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 473,
  name: "[Costs] Tuition (In & Out of State)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=District+Tuition%2CState+Tuition%2COut+Of+State+Tuition&time=Year.latest`,
  logic: (resp) => {
    if (!resp.data.length) {
      return {
        inStateTuition: false,
        outOfStateTuition: false,  
        districtTuition: false,  
        costInStateOutState: false
      };
    }
    const data = resp.data[0];

    return {
      inStateTuition: data["State Tuition"],
      outOfStateTuition: data["Out Of State Tuition"],
      districtTuition: data["District Tuition"],
      costInStateOutState: 100 * data["Out Of State Tuition"] / data["State Tuition"]
    }
  }
};

export default generator;
