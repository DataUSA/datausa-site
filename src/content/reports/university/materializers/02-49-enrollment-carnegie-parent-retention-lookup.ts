// Converted from legacy canon_cms_materializer #49 "[Enrollment] Carnegie Parent Retention Lookup" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 49,
  name: "[Enrollment] Carnegie Parent Retention Lookup",
  ordering: 2,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {_nameCarnegieParent, retentionRate, carnegieParentsRetentionRateList, nameCarnegieParent} = variables;
    const url = (d: any) => `<a href='/profile/university/${d["Carnegie Parent ID"]}'>${d["Carnegie Parent"]}</a>`;

    const cp = carnegieParentsRetentionRateList.find((d: any) => d["Carnegie Parent"] == _nameCarnegieParent);

    const retentionRateCarnegieParent: any = cp ? cp["Full Time Retention Rate"] : false;
    const retentionRateDiff = retentionRate - retentionRateCarnegieParent;

    let retentionRateText: any = ""

    if(nameCarnegieParent && retentionRateCarnegieParent){
      retentionRateText = `Compared with the full-time retention rate at similar ${nameCarnegieParent} (${formatters.abbreviate(retentionRateCarnegieParent)}%), ${variables.name} had a retention rate ${formatters.highWord(retentionRateDiff)} its peers.`
    }

    return {
      cp,
      retentionRateCarnegieParent,
      retentionRateDiff,
      retentionRateText
    }
  }
};

export default materializer;
