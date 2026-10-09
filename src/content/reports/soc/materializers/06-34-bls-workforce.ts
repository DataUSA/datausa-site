// Converted from legacy canon_cms_materializer #34 "BLS Workforce" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 34,
  name: "BLS Workforce",
  ordering: 6,
  allowed: "always",
  logic: (variables) => {
    const {blsID, blsName, id, jobsGrowth, jobsGrowthNation, name} = variables;

    return {
      blsSubtitle: blsID && (blsID !== id || blsName.toLowerCase() !== name.toLowerCase()) 
        ? `For growth projections, the closest comparible industry reported by the Bureau of Labor Statistics is ${blsName}.` 
        : false,
      jobsGrowthComp: jobsGrowth - jobsGrowthNation
    }
  }
};

export default materializer;
