// Converted from legacy canon_cms_materializer #66 "[Employment] Average Wage" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 66,
  name: "[Employment] Average Wage",
  ordering: 10,
  allowed: "always",
  logic: (variables) => {
    const {avgSalary, avgSalaryNation} = variables;

    const diffAverageWage = (avgSalary - avgSalaryNation)
    const diffAverageWageWord = diffAverageWage > 0 ? "more" : "less"
    return {
      diffAverageWage: Math.abs(diffAverageWage),
      diffAverageWageWord
    }
  }
};

export default materializer;
