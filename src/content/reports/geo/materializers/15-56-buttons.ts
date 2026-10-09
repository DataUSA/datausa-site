// Converted from legacy canon_cms_materializer #56 "Buttons" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 56,
  name: "Buttons",
  ordering: 15,
  allowed: "always",
  logic: (variables) => {
    return {
      sex0: "All",
      sex1: "Men",
      sex2: "Women",
      workforce: "Workforce",
      wage: "Average Wage",
      value: "Value",
      valueMeasure: "Value",
      growth: "Yearly Change",
      specialization: "Specialization",
      percentage: "Percentage",
      applicants: "Applicants Admitted (%)",
      admitted: "Admitted who Enrolled (%)",
      enrolled: "Enrolled",
      population: "Population",
      genderOption: "Gender",
      ageOption: "Age Range",
      raceOption: "Race & Ethnicity",
      raceGenderOption: "Gender, Race & Ethnicity",
      ageSexOption: "Age and Sex",
      typeInsurance: "Type of Health Insurance",
      statusEducation0: "All",
      statusEducation1: "Public",
      statusEducation2: "Private",
      degreesOption: "Degrees",
      sectorOption: "Sectors",
      propertyTaxes: "Property Taxes",
      propertyValue: "Property Value",
      rentOwn: "Rent vs Own",
      homeownersMortgage: "Homeowners with Mortgage",
      socialNeed_opt1: "Violent Crimes",
      socialNeed_opt2: "Injury Deaths",
      socialNeed_opt3: "Homicides",
      socialNeed_opt4: "Firearm Fatalities",
      socialNeed_opt5: "Motor Vehicle Crash Deaths",
      lengthOfLife: "Length of Life",
      qualityOfLife: "Quality of Life",
      dietAndExerciseOption: "Diet and Exercise",
      alcoholDrugsTobaccoOption: "Alcohol, Drugs and Tobacco",
      accessCareOption: "Access to Care",
      accessQualityOption: "Quality of Care", 
      allPopulation: "All Population",
      age25: "Adults Age 25 and Older",
      numberOfEstablishments: "Establishments",
      numberOfEmployees: "Employees",
      share: "Share",
    }
  }
};

export default materializer;
