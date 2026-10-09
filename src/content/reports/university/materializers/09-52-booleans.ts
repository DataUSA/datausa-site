// Converted from legacy canon_cms_materializer #52 "Booleans" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 52,
  name: "Booleans",
  ordering: 9,
  allowed: "always",
  logic: (variables) => {
    const {defaultRate, idCounty, isUniversity} = variables;

    return {
      hasLocation: idCounty && isUniversity,
      showDefaultRate: isUniversity && defaultRate
    }
  }
};

export default materializer;
