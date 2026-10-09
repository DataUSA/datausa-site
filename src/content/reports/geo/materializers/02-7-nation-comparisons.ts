// Converted from legacy canon_cms_materializer #7 "Nation Comparisons" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 7,
  name: "Nation Comparisons",
  ordering: 2,
  allowed: "always",
  logic: (variables) => {
    const retObj: Record<string, any> = {
      citizenshipComp: variables.citizenshipCurr - variables.citizenshipNation,
      foreignbornComp: variables.foreignbornCurr - variables.foreignbornNation,
      homeownerComp: variables.homeownerCurr - variables.homeownerNation,
      incomeComp: variables.incomeCurr - variables.incomeNation,
      languageDiff: variables.languagePct - variables.languagePctNation,
      povertyComp: variables.povertyRate - variables.povertyRateUS,
      propertyDiff: variables.propertyCurr - variables.propertyNation,
      propertyRatio: variables.propertyCurr / variables.propertyNation,
      vehiclesDiff: variables.vehiclesNum - variables.vehiclesNation
    };

    for (let i = 0; i < 3; i++) {
      if (variables[`gini${i + 1}Curr`]) {
        const curr = variables[`gini${i + 1}Curr`];
        retObj[`gini${i + 1}Comp`] = curr - variables.giniNation;
        retObj[`gini${i + 1}CompDir`] = (curr - variables.giniNation) * -1;
      }
    }

    return retObj;
  }
};

export default materializer;
