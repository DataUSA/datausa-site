// Converted from legacy canon_cms_generator #264 "[Costs] Tuition (Nation)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 264,
  name: "[Costs] Tuition (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year&locale=en&measures=District+Tuition%2CState+Tuition%2COut+Of+State+Tuition&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data[0];

    return {
      inStateTuitionNation: data["State Tuition"],
      districtTuitionNation: data["District Tuition"],
      outOfStateTuitionNation: data["Out Of State Tuition"],
      costInStateOutStateNation: 100 * data["Out Of State Tuition"] / data["State Tuition"]
    }
  }
};

export default generator;
