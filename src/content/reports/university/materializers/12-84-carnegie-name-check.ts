// Converted from legacy canon_cms_materializer #84 "Carnegie Name Check" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 84,
  name: "Carnegie Name Check",
  ordering: 12,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {name, nameCarnegieParent, _nameCarnegieParent, financeReturn, financeRatio, financeCarnegieParentRatio, financeCarnegieParentReturn, financeCarnegieParentEndowment, enrollmentFTPercent, enrollmentFulltimePercentCarnegieParent} = variables;


    let operationsCarnegieText: any = ""
    let enrollmentsCarnegieText: any = ""

    if(nameCarnegieParent && nameCarnegieParent !== "Unknown" ){
      operationsCarnegieText = financeRatio ? `The return on its endowment was of ${formatters.abbreviate(financeReturn)} ${financeRatio} compared to the ${formatters.abbreviate(financeCarnegieParentRatio)}% average return (${formatters.abbreviate(financeCarnegieParentReturn)} on ${formatters.abbreviate(financeCarnegieParentEndowment)}) across all ${nameCarnegieParent}.` : "The return on its endowment was not reported.";
      enrollmentsCarnegieText = `This means that ${formatters.abbreviate(enrollmentFTPercent)}% of students enrolled at ${name} are enrolled full-time compared with ${formatters.abbreviate(enrollmentFulltimePercentCarnegieParent)}% at similar ${nameCarnegieParent}.`
    }

    else {
      operationsCarnegieText = "";
      enrollmentsCarnegieText = ""
    }

    return {
      operationsCarnegieText,
      enrollmentsCarnegieText
    }




  }
};

export default materializer;
