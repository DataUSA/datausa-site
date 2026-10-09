// Converted from legacy canon_cms_materializer #22 "VA Filter" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 22,
  name: "VA Filter",
  ordering: 5,
  allowed: "always",
  logic: (variables) => {
    return {
      vaFilter: ["FINALUSES", "VA", "TOTCOMOUT", "HS", "ORE", "GFGD", "G", "TOTII", "GFGN", "GSLE", "GFE", "GSLG", "Other", "Used", "TOTFU", "TOTVA", "TOTINDOUT", "V001", "V002", "V003", "F010", "F020", "F030", "F040", "F050", "F100"]
    }
  }
};

export default materializer;
