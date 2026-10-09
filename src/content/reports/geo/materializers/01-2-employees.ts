// Converted from legacy canon_cms_materializer #2 "Employees" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 2,
  name: "Employees",
  ordering: 1,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {
      hierarchy,
      empAcsCurr,
      empAcsCurrYear,
      empAcsCurrMoe,
      empAcsPrev,
      empAcsPrevYear,
      empAcsPrevMoe,
      empPumsCurr,
      empPumsCurrYear,
      empPumsCurrMoe,
      empPumsPrev,
      empPumsPrevYear,
      empPumsPrevMoe,
      id
    } = variables;

    const usePums: any = ["Nation", "State", "PUMA"].includes(hierarchy) || id === "16000US2148000";

    const curr = usePums ? empPumsCurr : empAcsCurr;
    const currValidation: any = curr ? curr : false
    const prev = usePums ? empPumsPrev : empAcsPrev;
    const currYear = usePums ? empPumsCurrYear : empAcsCurrYear;
    const prevYear = usePums ? empPumsPrevYear : empAcsPrevYear;
    const currMoe = usePums ? empPumsCurrMoe : empAcsCurrMoe;
    const prevMoe = usePums ? empPumsPrevMoe : empAcsPrevMoe;

    const retObj: Record<string, any> = {
      useAcs: !usePums,
      empCurr: currValidation,
      empCurrYear: currYear,
      empCurrMoe: currMoe,
      empPrev: prev,
      empPrevYear: prevYear,
      empPrevMoe: prevMoe,
      empGrowth: formatters.growth({curr, prev}),
      empGrowthMoe: formatters.growth({curr, prev, currMoe, prevMoe}),
      usePums
    };

    const key: string = "empGrowth";
    const {growthPct, growthWord} = formatters;
    retObj.empSubtitle = retObj[key]
      ? `${growthPct(retObj[key])} 1-year ${growthWord(retObj[key])}`
      : "";

    return retObj;
  }
};

export default materializer;
