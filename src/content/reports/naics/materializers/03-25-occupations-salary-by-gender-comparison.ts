// Converted from legacy canon_cms_materializer #25 "[Occupations] Salary By Gender Comparison" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 25,
  name: "[Occupations] Salary By Gender Comparison",
  ordering: 3,
  allowed: "always",
  logic: (variables) => {
    const {menWage, womenWage} = variables;

    const times = menWage / womenWage;

    return {
      comparisonSalaryMale: menWage > womenWage?"more":"less",
      comparisonSalaryMaleTimes: times
    }
  }
};

export default materializer;
