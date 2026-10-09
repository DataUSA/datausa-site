// Converted from legacy canon_cms_materializer #90 "BLS IDs" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 90,
  name: "BLS IDs",
  ordering: 11,
  allowed: "always",
  logic: (variables) => {
    const {blsIds} = variables;

    const blsIDsList = Object.values(blsIds).join(',');


    return {
      blsIDsList
    }
  }
};

export default materializer;
