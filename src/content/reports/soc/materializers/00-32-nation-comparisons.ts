// Converted from legacy canon_cms_materializer #32 "Nation Comparisons" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 32,
  name: "Nation Comparisons",
  ordering: 0,
  allowed: "always",
  logic: (variables) => {
    const {avgSalary, avgSalaryNation, giniCurr, giniNation} = variables;

    return {
      giniComp: giniCurr - giniNation,
      giniCompDir: (giniCurr - giniNation) * -1,
      salaryComp: avgSalary - avgSalaryNation,
      salaryCompAbs: Math.abs(avgSalary - avgSalaryNation)
    }
  }
};

export default materializer;
