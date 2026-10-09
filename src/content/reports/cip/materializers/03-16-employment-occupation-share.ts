// Converted from legacy canon_cms_materializer #16 "[Employment] Occupation Share" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 16,
  name: "[Employment] Occupation Share",
  ordering: 3,
  allowed: "always",
  logic: (variables) => {
    const {commonOccupationTopPopulation, currForce} = variables;
    const commonOccupationTopShare = (commonOccupationTopPopulation / currForce) * 100;

    return {
      commonOccupationTopShare
    }
  }
};

export default materializer;
