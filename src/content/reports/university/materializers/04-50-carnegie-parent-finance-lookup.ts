// Converted from legacy canon_cms_materializer #50 "Carnegie Parent Finance Lookup" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 50,
  name: "Carnegie Parent Finance Lookup",
  ordering: 4,
  allowed: "always",
  logic: (variables) => {
    const {_nameCarnegieParent, carnegieParentsFinanceList, financeEndowment, idCarnegieParent} = variables;

    const cp = carnegieParentsFinanceList.find((d: any) => d["Carnegie Parent"] == _nameCarnegieParent);

    const financeCarnegieParentEndowment: any = cp["Median Endowment Value"] ? cp["Median Endowment Value"] : false;
    const financeCarnegieParentReturn: any = cp["Median Investment Income"] ? cp["Median Investment Income"] : false;
    const financeCarnegieParentRatio = (financeCarnegieParentReturn / financeCarnegieParentEndowment) * 100;

    const financeCarnegieParentEndowmentDiff = financeEndowment - financeCarnegieParentEndowment;
    const financeCarnegieParentEndowmentDiffAbs = Math.abs(financeCarnegieParentEndowmentDiff);

    const salary = variables[`${idCarnegieParent}_Salaries`];
    const expense = variables[`${idCarnegieParent}_Expenses`];
    return {
      financeCarnegieParentEndowment,
      financeCarnegieParentReturn,
      financeCarnegieParentRatio,
      financeCarnegieParentEndowmentDiff,
      financeCarnegieParentEndowmentDiffAbs,

      salaryCarnegieParent: salary,
      expenseCarnegieParent: expense,
      overallExpenditure: 100 * (salary / expense)
    }
  }
};

export default materializer;
