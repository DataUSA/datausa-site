// Converted from legacy canon_cms_materializer #57 "Visibility Selectors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 57,
  name: "Visibility Selectors",
  ordering: 16,
  allowed: "always",
  logic: (variables) => {
    const {isNation, isStateCounty, hierarchy, textStateCountyHealthOutcomes_indicator_1,
      textStateCountyHealthOutcomes_indicator_2,textStateCountyHealthOutcomes_indicator_3,
      textStateCountyHealthOutcomes_indicator_4, textStateCountyHealthOutcomes_indicator_5,
      textStateCountyHealthOutcomes_indicator_6, textStateCountyHealthOutcomes_indicator_7,
      textStateCountyHealthOutcomes_indicator_8, textStateCountyHealthOutcomes_indicator_9,
      textStateCountyHealthOutcomes_indicator_10, textStateCountyHealthOutcomes_indicator_11,
      textStateCountyHealthOutcomes_indicator_12, isNationStateCountynotPR,
      textStateCountyHealthBehavior_indicator_1, textStateCountyHealthBehavior_indicator_2,
      textStateCountyHealthBehavior_indicator_3, textStateCountyHealthBehavior_indicator_4,
      textStateCountyHealthBehavior_indicator_5, textStateCountyHealthBehavior_indicator_6, 
      textStateCountyHealthBehavior_indicator_7, textStateCountyHealthBehavior_indicator_8,
      textStateCountyHealthBehavior_indicator_9, textStateCountyHealthBehavior_indicator_10,
      textStateCountyHealthCare_indicator_1, textStateCountyHealthCare_indicator_2,
      textStateCountyHealthCare_indicator_3, textStateCountyHealthCare_indicator_4,
      textStateCountyHealthCare_indicator_5, textStateCountyHealthCare_indicator_6,
      textStateCountyHealthCare_indicator_7, textStateCountyHealthCare_indicator_8, textStateCountyHealthCare_indicator_9} = variables;
  
    const healthCare = textStateCountyHealthCare_indicator_1 || textStateCountyHealthCare_indicator_2 || textStateCountyHealthCare_indicator_3 || textStateCountyHealthCare_indicator_4 || textStateCountyHealthCare_indicator_5 || textStateCountyHealthCare_indicator_6 || textStateCountyHealthCare_indicator_7 || textStateCountyHealthCare_indicator_8 || textStateCountyHealthCare_indicator_9 
    const visibleHealthCare = isNation || (isNationStateCountynotPR && healthCare)

    return {
      visibleHealthCare,
      //Health Outcomes
      visibleLengthOfLife_lengthOfLife: true,
      visibleLengthOfLife_qualityOfLife: false,
      visibleQualityOfLife_lengthOfLife: false,
      visibleQualityOfLife_qualityOfLife: true,
  
      visibleNationLengthLife_lengthOfLife: isNation,
      visibleNationLengthLife_qualityOfLife: false,
      visibleNationQualityLife_lengthOfLife: false,
      visibleNationQualityLife_qualityOfLife: isNation,
  
      visibleStateLengthLife_lengthOfLife: hierarchy === "State" || hierarchy === "County",
      visibleStateLengthLife_qualityOfLife: false,
      visibleStateQualityLife_lengthOfLife: false,
      visibleStateQualityLife_qualityOfLife: hierarchy === "State" || hierarchy === "County",
  
      // Health Outcomes Indicator 1
      visibleStateLengthLife_lengthOfLife_indicator_1: textStateCountyHealthOutcomes_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_1: false,
      visibleStateQualityLife_lengthOfLife_indicator_1: false,
      visibleStateQualityLife_qualityOfLife_indicator_1: textStateCountyHealthOutcomes_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
  
        // Health Outcomes Indicator 2
      visibleStateLengthLife_lengthOfLife_indicator_2: textStateCountyHealthOutcomes_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_2: false,
      visibleStateQualityLife_lengthOfLife_indicator_2: false,
      visibleStateQualityLife_qualityOfLife_indicator_2: textStateCountyHealthOutcomes_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
  
        // Health Outcomes Indicator 3
      visibleStateLengthLife_lengthOfLife_indicator_3: textStateCountyHealthOutcomes_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_3: false,
      visibleStateQualityLife_lengthOfLife_indicator_3: false,
      visibleStateQualityLife_qualityOfLife_indicator_3: textStateCountyHealthOutcomes_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
  
        // Health Outcomes Indicator 4
      visibleStateLengthLife_lengthOfLife_indicator_4: textStateCountyHealthOutcomes_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_4: false,
      visibleStateQualityLife_lengthOfLife_indicator_4: false,
      visibleStateQualityLife_qualityOfLife_indicator_4: textStateCountyHealthOutcomes_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 5
      visibleStateLengthLife_lengthOfLife_indicator_5: textStateCountyHealthOutcomes_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_5: false,
      visibleStateQualityLife_lengthOfLife_indicator_5: false,
      visibleStateQualityLife_qualityOfLife_indicator_5: textStateCountyHealthOutcomes_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 6
      visibleStateLengthLife_lengthOfLife_indicator_6: textStateCountyHealthOutcomes_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_6: false,
      visibleStateQualityLife_lengthOfLife_indicator_6: false,
      visibleStateQualityLife_qualityOfLife_indicator_6: textStateCountyHealthOutcomes_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 7
      visibleStateLengthLife_lengthOfLife_indicator_7: textStateCountyHealthOutcomes_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_7: false,
      visibleStateQualityLife_lengthOfLife_indicator_7: false,
      visibleStateQualityLife_qualityOfLife_indicator_7: textStateCountyHealthOutcomes_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 8
      visibleStateLengthLife_lengthOfLife_indicator_8: textStateCountyHealthOutcomes_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_8: false,
      visibleStateQualityLife_lengthOfLife_indicator_8: false,
      visibleStateQualityLife_qualityOfLife_indicator_8: textStateCountyHealthOutcomes_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 9
      visibleStateLengthLife_lengthOfLife_indicator_9: textStateCountyHealthOutcomes_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_9: false,
      visibleStateQualityLife_lengthOfLife_indicator_9: false,
      visibleStateQualityLife_qualityOfLife_indicator_9: textStateCountyHealthOutcomes_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 10
      visibleStateLengthLife_lengthOfLife_indicator_10: textStateCountyHealthOutcomes_indicator_10 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_10: false,
      visibleStateQualityLife_lengthOfLife_indicator_10: false,
      visibleStateQualityLife_qualityOfLife_indicator_10: textStateCountyHealthOutcomes_indicator_10 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 11
      visibleStateLengthLife_lengthOfLife_indicator_11: textStateCountyHealthOutcomes_indicator_11 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_11: false,
      visibleStateQualityLife_lengthOfLife_indicator_11: false,
      visibleStateQualityLife_qualityOfLife_indicator_11: textStateCountyHealthOutcomes_indicator_11 && (hierarchy === "State" || hierarchy === "County"),
  
  
        // Health Outcomes Indicator 12
      visibleStateLengthLife_lengthOfLife_indicator_12: textStateCountyHealthOutcomes_indicator_12 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateLengthLife_qualityOfLife_indicator_12: false,
      visibleStateQualityLife_lengthOfLife_indicator_12: false,
      visibleStateQualityLife_qualityOfLife_indicator_12: textStateCountyHealthOutcomes_indicator_12 && (hierarchy === "State" || hierarchy === "County"),
  
  
  
        //Health Behaviors
      visibleDietAndExercise_dietAndExerciseOption: true,
      visibleDietAndExercise_alcoholDrugsTobaccoOption: false,
      visibleAlcoholDrugsTobacco_dietAndExerciseOption: false,
      visibleAlcoholDrugsTobacco_alcoholDrugsTobaccoOption: true,
  
      visibleNationDietAndExercise_dietAndExerciseOption: isNation,
      visibleNationDietAndExercise_alcoholDrugsTobaccoOption: false,
      visibleNationAlcoholDrugsTobacco_dietAndExerciseOption: false,
      visibleNationAlcoholDrugsTobacco_alcoholDrugsTobaccoOption: isNation,
  
      visibleStateDietAndExercise_dietAndExerciseOption: hierarchy === "State" || hierarchy === "County",
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption: hierarchy === "State" || hierarchy === "County",
  
  
      //Health Behaviors Indicator 1
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_1: textStateCountyHealthBehavior_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_1: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_1: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_1: textStateCountyHealthBehavior_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 2
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_2: textStateCountyHealthBehavior_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_2: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_2: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_2: textStateCountyHealthBehavior_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 3
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_3: textStateCountyHealthBehavior_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_3: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_3: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_3: textStateCountyHealthBehavior_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 4
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_4: textStateCountyHealthBehavior_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_4: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_4: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_4: textStateCountyHealthBehavior_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 5
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_5: textStateCountyHealthBehavior_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_5: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_5: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_5: textStateCountyHealthBehavior_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 6
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_6: textStateCountyHealthBehavior_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_6: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_6: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_6: textStateCountyHealthBehavior_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 7
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_7: textStateCountyHealthBehavior_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_7: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_7: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_7: textStateCountyHealthBehavior_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 8
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_8: textStateCountyHealthBehavior_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_8: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_8: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_8: textStateCountyHealthBehavior_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 9
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_9: textStateCountyHealthBehavior_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_9: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_9: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_9: textStateCountyHealthBehavior_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
  
        //Health Behaviors Indicator 10
      visibleStateDietAndExercise_dietAndExerciseOption_indicator_10: textStateCountyHealthBehavior_indicator_10 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateDietAndExercise_alcoholDrugsTobaccoOption_indicator_10: false,
      visibleStateAlcoholDrugsTobacco_dietAndExerciseOption_indicator_10: false,
      visibleStateAlcoholDrugsTobacco_alcoholDrugsTobaccoOption_indicator_10: textStateCountyHealthBehavior_indicator_10 && (hierarchy === "State" || hierarchy === "County"),
  
  
  
          //Clinical Care
      visibleAccessCare_accessCareOption: true,
      visibleAccessCare_accessQualityOption: false,
      visibleQualityCare_accessCareOption: false,
      visibleQualityCare_accessQualityOption: true,
  
      visibleNationAccessCare_accessCareOption: isNation,
      visibleNationAccessCare_accessQualityOption: false,
      visibleNationQualityCare_accessCareOption: false,
      visibleNationQualityCare_accessQualityOption: isNation,
  
      visibleStateAccessCare_accessCareOption: hierarchy === "State" || hierarchy === "County",
      visibleStateAccessCare_accessQualityOption: false,
      visibleStateQualityCare_accessCareOption: false,
      visibleStateQualityCare_accessQualityOption: hierarchy === "State" || hierarchy === "County",
  
  
      // Clinical Care Indicator 1
      visibleStateAccessCare_accessCareOption_indicator_1: textStateCountyHealthCare_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_1: false,
      visibleStateQualityCare_accessCareOption_indicator_1: false,
      visibleStateQualityCare_accessQualityOption_indicator_1: textStateCountyHealthCare_indicator_1 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 2
      visibleStateAccessCare_accessCareOption_indicator_2: textStateCountyHealthCare_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_2: false,
      visibleStateQualityCare_accessCareOption_indicator_2: false,
      visibleStateQualityCare_accessQualityOption_indicator_2: textStateCountyHealthCare_indicator_2 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 3
      visibleStateAccessCare_accessCareOption_indicator_3: textStateCountyHealthCare_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_3: false,
      visibleStateQualityCare_accessCareOption_indicator_3: false,
      visibleStateQualityCare_accessQualityOption_indicator_3: textStateCountyHealthCare_indicator_3 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 4
      visibleStateAccessCare_accessCareOption_indicator_4: textStateCountyHealthCare_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_4: false,
      visibleStateQualityCare_accessCareOption_indicator_4: false,
      visibleStateQualityCare_accessQualityOption_indicator_4: textStateCountyHealthCare_indicator_4 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 5
      visibleStateAccessCare_accessCareOption_indicator_5: textStateCountyHealthCare_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_5: false,
      visibleStateQualityCare_accessCareOption_indicator_5: false,
      visibleStateQualityCare_accessQualityOption_indicator_5: textStateCountyHealthCare_indicator_5 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 6
      visibleStateAccessCare_accessCareOption_indicator_6: textStateCountyHealthCare_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_6: false,
      visibleStateQualityCare_accessCareOption_indicator_6: false,
      visibleStateQualityCare_accessQualityOption_indicator_6: textStateCountyHealthCare_indicator_6 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 7
      visibleStateAccessCare_accessCareOption_indicator_7: textStateCountyHealthCare_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_7: false,
      visibleStateQualityCare_accessCareOption_indicator_7: false,
      visibleStateQualityCare_accessQualityOption_indicator_7: textStateCountyHealthCare_indicator_7 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 8
      visibleStateAccessCare_accessCareOption_indicator_8: textStateCountyHealthCare_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_8: false,
      visibleStateQualityCare_accessCareOption_indicator_8: false,
      visibleStateQualityCare_accessQualityOption_indicator_8: textStateCountyHealthCare_indicator_8 && (hierarchy === "State" || hierarchy === "County"),
  
        // Clinical Care Indicator 9
      visibleStateAccessCare_accessCareOption_indicator_9: textStateCountyHealthCare_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
      visibleStateAccessCare_accessQualityOption_indicator_9: false,
      visibleStateQualityCare_accessCareOption_indicator_9: false,
      visibleStateQualityCare_accessQualityOption_indicator_9: textStateCountyHealthCare_indicator_9 && (hierarchy === "State" || hierarchy === "County"),
  
    }
  
  }
};

export default materializer;
