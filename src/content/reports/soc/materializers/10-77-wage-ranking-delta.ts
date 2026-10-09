// Converted from legacy canon_cms_materializer #77 "[Wage Ranking] Delta" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 77,
  name: "[Wage Ranking] Delta",
  ordering: 10,
  allowed: "always",
  logic: (variables) => {
    let deltaAvgWage: any;
    const {avgYearlyWage, avgYearlyWageNational} = variables;

    deltaAvgWage = avgYearlyWage - avgYearlyWageNational

    const deltaAvgWageWord = deltaAvgWage > 0 ? "more" : "less"

    return {
      deltaAvgWage: Math.abs(deltaAvgWage),
      deltaAvgWageWord
    }
  }
};

export default materializer;
