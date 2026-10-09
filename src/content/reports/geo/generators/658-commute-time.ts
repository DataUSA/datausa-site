// Converted from legacy canon_cms_generator #658 "Commute (Time)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 658,
  name: "Commute (Time)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygt_mean_transportation_time_to_work_5&include=Nation:01000US&measures=Average+Commute+Time&time=Year.latest&drilldowns=Year`,
  logic: (resp) => {
    const nation = resp.data[0] ? resp.data[0]["Average Commute Time"] : 0

    return {
      commuteTimeNation: nation,
    }
  }
};

export default generator;
