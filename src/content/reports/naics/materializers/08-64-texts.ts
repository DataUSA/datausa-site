// Converted from legacy canon_cms_materializer #64 "Texts" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 64,
  name: "Texts",
  ordering: 8,
  allowed: "always",
  logic: (variables) => {
    return {
      pumas_Text: "Public Use Microdata Areas (PUMAs)",
      states_Text: "States",
      workforce_Text: "largest workforce",
      wage_Text: "best average annual wages",
      specialization_Text: "greatest specialization"
  
    }
  }
};

export default materializer;
