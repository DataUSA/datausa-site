// Converted from legacy canon_cms_materializer #30 "BLS Subtitle" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 30,
  name: "BLS Subtitle",
  ordering: 6,
  allowed: "always",
  logic: (variables) => {
    const {blsID, blsName, id, name, jobsGrowthIndustry, jobsGrowthNation} = variables;


    return {
      blsSubtitle: blsID && (blsID.join("-") !== id.toString() || blsName.toLowerCase() !== name.toLowerCase()) 
        ? `For growth projections, the closest comparable industry reported by the Bureau of Labor Statistics is ${blsName}.` 
        : false,
      jobsGrowthComp: jobsGrowthIndustry - jobsGrowthNation
    }
  }
};

export default materializer;
