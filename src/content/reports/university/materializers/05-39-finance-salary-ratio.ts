// Converted from legacy canon_cms_materializer #39 "Finance Salary Ratio" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 39,
  name: "Finance Salary Ratio",
  ordering: 5,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {financeExpenses, financeSalaries} = variables;
    const {abbreviate} = formatters;

    const financeSalaryRatio: any = financeExpenses ? (financeSalaries / financeExpenses) * 100 : false

    return {
      financeSalaryRatio,
      financeSalaryRatioText: financeSalaryRatio ? `which represents ${abbreviate(financeSalaryRatio)}% of their overall expenditure ($${abbreviate(financeExpenses)}) and` : "",
    }
  }
};

export default materializer;
