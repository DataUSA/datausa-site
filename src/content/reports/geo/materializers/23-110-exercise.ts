// Converted from legacy canon_cms_materializer #110 "Exercise" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 110,
  name: "Exercise",
  ordering: 23,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy,
    exercise1NameNation,
    exercise2NameNation,
    exercise3NameNation,
    exercise1ValueNation,
    exercise2ValueNation,
    exercise3ValueNation,
    exercise1SubNation,
    exercise2SubNation,
    exercise3SubNation,
    exerciseNation,
    exerciseMeasureNation,
    exerciseYearNation,
    exerciseNationVisible1,
    exerciseNationVisibleText1,
    exerciseNationVisibleMore,

    exercise1NameNotNation,
    exercise2NameNotNation,
    exercise3NameNotNation,
    exercise1ValueNotNation,
    exercise2ValueNotNation,
    exercise3ValueNotNation,
    exercise1SubNotNation,
    exercise2SubNotNation,
    exercise3SubNotNation,
    exerciseNotNation,
    exerciseMeasureNotNation,
    exerciseYearNotNation,
    exerciseNotNationVisible1,
    exerciseNotNationVisibleText1,
    exerciseNotNationVisibleMore
    } = variables;

    return{
     exerciseVisible1: hierarchy === "Nation" ? exerciseNationVisible1 : exerciseNotNationVisible1,
     exerciseVisibleText1: hierarchy === "Nation" ? exerciseNationVisibleText1 : exerciseNotNationVisibleText1,
     exerciseVisibleMore: hierarchy === "Nation" ? exerciseNationVisibleMore : exerciseNotNationVisibleMore,
     exercise1Name: hierarchy === "Nation" ? exercise1NameNation : exercise1NameNotNation,
     exercise2Name: hierarchy === "Nation" ? exercise2NameNation : exercise2NameNotNation,
     exercise3Name: hierarchy === "Nation" ? exercise3NameNation : exercise3NameNotNation,
     exercise1Value: hierarchy === "Nation" ? exercise1ValueNation : exercise1ValueNotNation,
     exercise2Value: hierarchy === "Nation" ? exercise2ValueNation : exercise2ValueNotNation,
     exercise3Value: hierarchy === "Nation" ? exercise3ValueNation : exercise3ValueNotNation,
     exercise1Sub: hierarchy === "Nation" ? exercise1SubNation : exercise1SubNotNation,
     exercise2Sub: hierarchy === "Nation" ? exercise2SubNation : exercise2SubNotNation,
     exercise3Sub: hierarchy === "Nation" ? exercise3SubNation : exercise3SubNotNation,
     exercise: hierarchy === "Nation" ? exerciseNation : exerciseNotNation,
     exerciseMeasure: hierarchy === "Nation" ? exerciseMeasureNation : exerciseMeasureNotNation,
     exerciseYear: hierarchy === "Nation" ? exerciseYearNation : (hierarchy === "PUMA" ? false : exerciseYearNotNation)
    }
  }
};

export default materializer;
