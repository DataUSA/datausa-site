// Converted from legacy canon_cms_materializer #117 "Buttons for health section" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 117,
  name: "Buttons for health section",
  ordering: 30,
  allowed: "always",
  logic: (variables, {swap}) => {
    const lengthLife: any = [
      {"id": "1", "name": "Child Mortality"},
      {"id": "2", "name": "Infant Mortality"},
      {"id": "3", "name": "Premature Deaths"},
      {"id": "4", "name": "Premature Age-Adjusted Mortality"},
    ]

    let lenghtOfLife = lengthLife.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleLengthOfLife_[[healthOutcomesOptions]]`)
    }));


    const qualityLife: any = [
      {"id": "5", "name": "Low Birthweight"},
      {"id": "6", "name": "Poor Physical Health Days"},
      {"id": "7", "name": "Poor Mental Health Days"},
      {"id": "8", "name": "Poor or Fair Health"},
      {"id": "9", "name": "Frequent Physical Distress"},
      {"id": "10", "name": "Frequent Mental Distress"},
      {"id": "11", "name": "Diabetes Prevalence"},
      {"id": "12", "name": "HIV Prevalence"}
    ]

    let qualityOfLife_ = qualityLife.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleQualityOfLife_[[healthOutcomesOptions]]`)
    }));


    const dietAndExercise_: any = [
      {"id": "1", "name": "Adult Obesity"},
      {"id": "2", "name": "Access to Exercise Opportunities"},
      {"id": "3", "name": "Food Environment Index"},
      {"id": "4", "name": "Food Insecurity"},
      {"id": "5", "name": "Limited Access to Healthy Food"},
      {"id": "6", "name": "Physical Inactivity"}
    ]

    let dietAndExercise = dietAndExercise_.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleDietAndExercise_[[healthBehaviorsOptions]]`)
    }));


    const alcoholDrugsTobacco_: any = [
      {"id": "7", "name": "Adult Smoking"},
      {"id": "8", "name": "Drug Overdose Deaths"},
      {"id": "9", "name": "Excessive Drinking"},
      {"id": "10", "name": "Alcohol-Impaired Driving Deaths"}
    ]

    let alcoholDrugsTobacco = alcoholDrugsTobacco_.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleAlcoholDrugsTobacco_[[healthBehaviorsOptions]]`)
    }));

    //Clinical Care
    const accessCare_: any = [
      {"id": "1", "name": "Uninsured"},
      {"id": "2", "name": "Uninsured Adults"},
      {"id": "3", "name": "Uninsured Children"},
      {"id": "4", "name": "Other Primary Care Providers"},
      {"id": "5", "name": "Patient to Dentist Ratio"},
      {"id": "6", "name": "Patient to Primary Care Physician Ratio"},
      {"id": "7", "name": "Patient to Mental Health Provider Ratio"},
    ]

    let accessCare = accessCare_.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleAccessCare_[[clinicalCareOptions]]`)
    }));


    const qualityCare_: any = [
      {"id": "8", "name": "Preventable Hospital Stays"},
      {"id": "9", "name": "Mammography Screening"},
    ]

    let qualityCare = qualityCare_.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleQualityCare_[[clinicalCareOptions]]`)
    }));

    return {
      lenghtOfLife,
      qualityOfLife_,
      dietAndExercise,
      alcoholDrugsTobacco,
      accessCare,
      qualityCare
    }
  }
};

export default materializer;
