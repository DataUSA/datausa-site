// Converted from legacy canon_cms_materializer #54 "Data" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 54,
  name: "Data",
  ordering: 1,
  allowed: "always",
  logic: (variables) => {
    const {showSCTG, showSpending} = variables;

    const hasData = showSCTG || showSpending;

    return {
      hasData,
      noData: !hasData
    }
  }
};

export default materializer;
