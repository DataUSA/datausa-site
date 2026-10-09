// Converted from legacy canon_cms_materializer #75 "Dynamic Button" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 75,
  name: "Dynamic Button",
  ordering: 8,
  allowed: "always",
  logic: (variables) => {
    return {
  
      visibleEmployed_employedGA: true,
      visibleEmployed_unemployedGA: false,
      visibleUnemployed_employedGA: false,
      visibleUnemployed_unemployedGA: true,
    }
  }
};

export default materializer;
