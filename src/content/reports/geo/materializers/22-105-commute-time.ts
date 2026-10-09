// Converted from legacy canon_cms_materializer #105 "Commute Time" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 105,
  name: "Commute Time",
  ordering: 22,
  allowed: "always",
  logic: (variables) => {
    const {commuteTimeNation, commuteTime} = variables;

    const commuteTimeDiff = commuteTime - commuteTimeNation

    return {
      commuteTimeDiff
    }
  }
};

export default materializer;
