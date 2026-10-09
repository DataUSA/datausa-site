// Converted from legacy canon_cms_materializer #69 "Selector options" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 69,
  name: "Selector options",
  ordering: 7,
  allowed: "always",
  logic: (variables) => {
    // Employment

    let sex0: any = "All"
    let sex1: any = "Male"
    let sex2: any = "Female"

    let statesEBL: any = "States"
    let pumasEBL: any = "PUMAs"
    let workforceEBL: any = "Workforce"
    let avgWageEBL: any = "Average Wage"
    let specializationEBL: any = "Specialization"

    let workforceEOT: any = "Workforce"
    let avgWageEOT: any = "Average Wage"
    let simOccupationsEOT: any = "Similar Occupations"
    let genderEOT: any = "Gender"

    // Industry

    let avgWageOBI: any = "Average Wage"
    let workforceOBI: any = "Workforce"
    let valueOBI: any = "Value"
    let yearlyChangeOBI: any = "Yearly Change"

    // Diversity

    let employedGA: any = "Employed people"
    let unemployedGA: any = "Unemployed people"
    let workforceGA: any = "Workforce"
    let avgWageGA: any = "Average Wage"

    let employedE: any = "Employed people"
    let unemployedE: any = "Unemployed people"
    let genderFemaleE: any = "Women"
    let genderMaleE: any = "Men"
    let genderAllE: any = "All"

    let employedR: any = "Employed people"
    let unemployedR: any = "Unemployed people"
    let genderraceR: any = "Gender & Race"
    let racesR: any = "Races"
    let shareR: any = "Share of Races vs National Level"

    // Education & Skills

    let commonMajors: any = "Common Majors"
    let specializedMajors: any = "Specialized Majors"

    let bachelorsDegree: any = "Bachelors Degree"
    let mastersDegree: any = "Masters Degree"
    let professionalDegree: any = "Professional Degree"
    let doctorateDegree: any = "Doctorate Degree"
    let allDegree: any = "All Degrees"

    let workforceEL: any = "Workforce"
    let wageEL: any = "Wage"

    let radarSkills: any = "Radar"
    let barchartSkills: any = "Bar Chart"
    let valueSkills: any = "Value"
    let rcaSkills: any = "RCA"

    return {
      bachelorsDegree,
      mastersDegree,
      professionalDegree,
      doctorateDegree,
      allDegree,
      commonMajors,
      specializedMajors,
      radarSkills,
      barchartSkills,
      valueSkills,
      rcaSkills,
      workforceEL,
      wageEL,
      employedR,
      unemployedR,
      genderraceR,
      racesR,
      shareR,
      sex0,
      sex1,
      sex2,
      statesEBL,
      pumasEBL,
      workforceEBL,
      avgWageEBL,
      specializationEBL,
      workforceEOT,
      avgWageEOT,
      simOccupationsEOT,
      genderEOT,
      avgWageOBI,
      workforceOBI,
      valueOBI,
      yearlyChangeOBI,
      employedGA,
      unemployedGA,
      workforceGA,
      avgWageGA,
      employedE,
      unemployedE,
      genderFemaleE,
      genderMaleE,
      genderAllE
    }


  }
};

export default materializer;
