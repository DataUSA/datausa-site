// Converted from legacy canon_cms_materializer #27 "Nation Comparisons" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 27,
  name: "Nation Comparisons",
  ordering: 2,
  allowed: "always",
  logic: (variables) => {
    const {avgSalary, avgSalaryNation, giniCurr, giniNation, jobsGrowthIndustry, jobsGrowthNation, outputGrowthIndustry, outputGrowthNation} = variables;

    return {
      giniComp: giniCurr - giniNation,
      giniCompDir: (giniCurr - giniNation) * -1,
      salaryComp: avgSalary - avgSalaryNation,
      jobsGrowthWord: jobsGrowthIndustry>jobsGrowthNation?'higher':'lower',
      outputGrowthWord: outputGrowthIndustry>outputGrowthNation?'higher':'lower',
    }
  }
};

export default materializer;
