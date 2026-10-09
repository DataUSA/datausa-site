// Converted from legacy canon_cms_materializer #76 "Parragraph Visibility" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 76,
  name: "Parragraph Visibility",
  ordering: 9,
  allowed: "always",
  logic: (variables) => {
    return {
      hidden: false,
  
      //Employment by location
      showParagraphWage_workforceEBL: false,
      showParagraphWage_specializationEBL: false,
      showParagraphWage_avgWageEBL: true,

      showParagraphWorkforce_workforceEBL: true,
      showParagraphWorkforce_avgWageEBL: false, 
      showParagraphWorkforce_specializationEBL: false,
  
      showParagraphRca_workforceEBL: false,
      showParagraphRca_avgWageEBL: false, 
      showParagraphRca_specializationEBL: true,

      // Employment Over Time

      showParragraphAvgWage_avgWageEOT: true,
      showParragraphAvgWage_workforceEOT: false,
  
      showParragraphWorkforce_avgWageEOT: false,
      showParragraphWorkforce_workforceEOT: true,
  
      // Occupations by Industry
  
      showParragraphAvgWage_avgWageOBI: true,
      showParragraphAvgWage_workforceOBI: false,
  
      showParragraphWorkforce_avgWageOBI: false,
      showParragraphWorkforce_workforceOBI: true,
  
      // Gender and Age // indicator_1: workforce, indicator_2: avg wage
  
      showParragraphAvgWage_employedGA_indicator_1: false,
      showParragraphAvgWage_employedGA_indicator_2: true,
  
      showParragraphWorkforce_employedGA_indicator_1: true,
      showParragraphWorkforce_employedGA_indicator_2: false,
  
      showParragraphUnemployment_unemployedGA_indicator_1: true,
      showParragraphUnemployment_unemployedGA_indicator_2: true,
  
      // Majors
  
      showParragraphCommon_commonMajors: true,
      showParragraphCommon_specializedMajors: false,
  
      showParragraphSpec_specializedMajors: true,
      showParragraphSpec_commonMajors: false,
  
      // Education levels
  
      showParragraphWage_wageEL: true,
      showParragraphWage_workforceEL: false,
  
      showParragraphWorkforce_wageEL: false,
      showParragraphWorkforce_workforceEL: true,
  
      // Skills
  
      showValue_valueSkills: true,
      showValue_rcaSkills: false,
  
      showRCA_valueSkills: false,
      showRCA_rcaSkills: true,
  
    }
  }
};

export default materializer;
