// Converted from legacy canon_cms_materializer #111 "Food Insecurity" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 111,
  name: "Food Insecurity",
  ordering: 24,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy,
      food1NameNation, food2NameNation, food3NameNation,
      food1ValueNation, food2ValueNation, food3ValueNation,
      food1SubNation, food2SubNation, food3SubNation,
      foodNation, foodMeasureNation, foodYearNation,
      foodNationVisible1, foodNationVisibleText1, foodNationVisibleMore,

      food1NameNotNation, food2NameNotNation, food3NameNotNation,
      food1ValueNotNation, food2ValueNotNation, food3ValueNotNation,
      food1SubNotNation, food2SubNotNation, food3SubNotNation,
      foodNotNation, foodMeasureNotNation, foodYearNotNation,
      foodNotNationVisible1, foodNotNationVisibleText1, foodNotNationVisibleMore
  
    } = variables;

    return{
     foodVisible1: hierarchy === "Nation" ? foodNationVisible1 : foodNotNationVisible1,
     foodVisibleText1: hierarchy === "Nation" ? foodNationVisibleText1 : foodNotNationVisibleText1,
     foodVisibleMore: hierarchy === "Nation" ? foodNationVisibleMore : foodNotNationVisibleMore,
     food1Name: hierarchy === "Nation" ? food1NameNation : food1NameNotNation,
     food2Name: hierarchy === "Nation" ? food2NameNation : food2NameNotNation,
     food3Name: hierarchy === "Nation" ? food3NameNation : food3NameNotNation,
     food1Value: hierarchy === "Nation" ? food1ValueNation : food1ValueNotNation,
     food2Value: hierarchy === "Nation" ? food2ValueNation : food2ValueNotNation,
     food3Value: hierarchy === "Nation" ? food3ValueNation : food3ValueNotNation,
     food1Sub: hierarchy === "Nation" ? food1SubNation : food1SubNotNation,
     food2Sub: hierarchy === "Nation" ? food2SubNation : food2SubNotNation,
     food3Sub: hierarchy === "Nation" ? food3SubNation : food3SubNotNation,
     food: hierarchy === "Nation" ? foodNation : foodNotNation,
     foodMeasure: hierarchy === "Nation" ? foodMeasureNation : foodMeasureNotNation,
     foodYear: hierarchy === "Nation" ? foodYearNation : (hierarchy === "PUMA" ? false : foodYearNotNation)
    }
  }
};

export default materializer;
