// Converted from legacy canon_cms_materializer #51 "[Tuition] Carnegie Parent Tuition Lookup" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 51,
  name: "[Tuition] Carnegie Parent Tuition Lookup",
  ordering: 0,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {_nameCarnegieParent, carnegieParents, tuitionCostCurr, tuitionYearCurr, name, nameCarnegieParent} = variables;

    const year: any = _nameCarnegieParent ? carnegieParents[_nameCarnegieParent]["Year"] : false

    const tuitionStateCarnegieParent: any = _nameCarnegieParent ? carnegieParents[_nameCarnegieParent]["State Tuition"] : false;
    const tuitionOutOfStateCarnegieParent: any = _nameCarnegieParent ? carnegieParents[_nameCarnegieParent]["Out Of State Tuition"] : false;
    const tuitionCarnegieParentDiff: any = _nameCarnegieParent ? tuitionCostCurr - tuitionOutOfStateCarnegieParent : false;

    let tuitionText: any = ""
    let tuitionCostsText: any = ""

    if(year == tuitionYearCurr) {
      tuitionText = `In ${tuitionYearCurr}, the median undergraduate tuition at ${name} is ${formatters.salary(tuitionCostCurr)}, which is ${formatters.salary(Math.abs(tuitionCarnegieParentDiff))} ${formatters.moreWord(tuitionCarnegieParentDiff)} the national average for ${nameCarnegieParent} (${formatters.salary(tuitionOutOfStateCarnegieParent)}).`
      tuitionCostsText = `The cost of tuition at ${name} is ${formatters.salary(tuitionCarnegieParentDiff)} ${formatters.moreWord(tuitionCarnegieParentDiff)} than the overall (public and private) national average for ${nameCarnegieParent} (${formatters.salary(tuitionOutOfStateCarnegieParent)}).`
    }

    else{
      tuitionText = `In ${tuitionYearCurr}, the median undergraduate tuition at ${name} is ${formatters.salary(tuitionCostCurr)}.`
      tuitionCostsText = ""
    }

    let aboutTuitionText: any = ""
    if (tuitionOutOfStateCarnegieParent) {
      aboutTuitionText = `The median undergraduate tuition at ${variables.name} is $${formatters.commas(tuitionCostCurr)}, which is $${formatters.commas(tuitionCarnegieParentDiff)} ${formatters.moreWord(tuitionCarnegieParentDiff)} the national average for ${nameCarnegieParent} ($${formatters.commas(tuitionOutOfStateCarnegieParent)}).`
    }

    else {
      aboutTuitionText = `The median undergraduate tuition at ${variables.name} is $${formatters.commas(tuitionCostCurr)}.`
    }

    return {
      tuitionStateCarnegieParent,
      tuitionOutOfStateCarnegieParent,
      tuitionCarnegieParentDiff,
      tuitionText,
      tuitionCostsText,
      aboutTuitionText
    }
  }
};

export default materializer;
