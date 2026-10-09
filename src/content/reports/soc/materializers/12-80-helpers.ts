// Converted from legacy canon_cms_materializer #80 "Helpers" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 80,
  name: "Helpers",
  ordering: 12,
  allowed: "always",
  logic: (variables) => {
    return {
      geoWord_statesEBL: "states",
      geoWord_pumasEBL: "Public Use Microdata Areas (PUMAs)"
    }
  }
};

export default materializer;
