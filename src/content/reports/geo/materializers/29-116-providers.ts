// Converted from legacy canon_cms_materializer #116 "Providers" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 116,
  name: "Providers",
  ordering: 29,
  allowed: "always",
  logic: (variables) => {
    const {  hierarchy, stateName, countyName, lastYearProviderCounty, lastYearProvider,
    PhysicianCurr, PhysicianCurrCounty, PhysicianPrev, PhysicianPrevCounty, PhysicianGrowth, PhysicianGrowthCounty,
    DentistCurr, DentistPrev, DentistGrowth, DentistCurrCounty, DentistPrevCounty, DentistGrowthCounty,
    MentalCurr, MentalPrev, MentalGrowth, MentalCurrCounty, MentalPrevCounty, MentalGrowthCounty,
    PrimaryCurr, PrimaryPrev, PrimaryGrowth, PrimaryCurrCounty, PrimaryPrevCounty, PrimaryGrowthCounty} = variables;

    return {
      providerName_: hierarchy === "County" ? countyName : stateName,
      providerYear_: hierarchy === "County" ? lastYearProviderCounty : lastYearProvider,
  
      //PROVIDER 1: PHYSICIANS
      value_provider1: hierarchy !== "County" ? PhysicianCurr : PhysicianCurrCounty,
      prevValue_provider1: hierarchy !== "County" ? PhysicianPrev : PhysicianPrevCounty,
      growthValue_provider1: hierarchy !== "County" ? PhysicianGrowth : PhysicianGrowthCounty,
  
      //PROVIDER 2: DENTIST
      value_provider2: hierarchy !== "County" ? DentistCurr : DentistCurrCounty,
      prevValue_provider2: hierarchy !== "County" ? DentistPrev : DentistPrevCounty,
      growthValue_provider2: hierarchy !== "County" ? DentistGrowth : DentistGrowthCounty,
  
      //PROVIDER 3: MENTAL
      value_provider3: hierarchy !== "County" ? MentalCurr : MentalCurrCounty,
      prevValue_provider3: hierarchy !== "County" ? MentalPrev : MentalPrevCounty,
      growthValue_provider3: hierarchy !== "County" ? MentalGrowth : MentalGrowthCounty,
  
      //PROVIDER 4: PRIMARY CARE
      value_provider4: hierarchy !== "County" ? PrimaryCurr : PrimaryCurrCounty,
      prevValue_provider4: hierarchy !== "County" ? PrimaryPrev : PrimaryPrevCounty,
      growthValue_provider4: hierarchy !== "County" ? PrimaryGrowth : PrimaryGrowthCounty,
  
    }
  }
};

export default materializer;
