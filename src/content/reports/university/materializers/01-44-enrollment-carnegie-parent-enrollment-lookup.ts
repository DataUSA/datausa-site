// Converted from legacy canon_cms_materializer #44 "[Enrollment] Carnegie Parent Enrollment Lookup" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 44,
  name: "[Enrollment] Carnegie Parent Enrollment Lookup",
  ordering: 1,
  allowed: "always",
  logic: (variables) => {
    const {_nameCarnegieParent, carnegieParentsEnrollmentList, isHiddenCarnegieParent, 
          financeEndowment} = variables;

    const url = (d: any) => `<a href='/profile/university/${d["Carnegie Parent ID"]}'>${d["Carnegie Parent"]}</a>`;

    // url(d) == nameCarnegieParent &&
    const ft = carnegieParentsEnrollmentList.find((d: any) => d["Enrollment Status ID"] === 1 && d["Carnegie Parent"] == _nameCarnegieParent);
    const pt = carnegieParentsEnrollmentList.find((d: any) => d["Enrollment Status ID"] === 2 && d["Carnegie Parent"] == _nameCarnegieParent);
    const total = ft["Enrollment"] + pt["Enrollment"];

    const enrollmentFulltimePercentCarnegieParent = (ft["Enrollment"] / total) * 100;

    return {
      ft,
      pt,
      enrollmentFulltimePercentCarnegieParent,
      isHiddenCarnegieParentCopy: isHiddenCarnegieParent && financeEndowment ? true : false
    }
  }
};

export default materializer;
