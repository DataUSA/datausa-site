// Converted from legacy canon_cms_generator #778 "[Prism-Health] Top Facilities" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 778,
  name: "[Prism-Health] Top Facilities",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=prism_facilities_by_households_served&drilldowns=Facility,Rank+Facility,Tract+Facility&include=Health+Provider:4;County+Household:${attrs.id}&locale=en&measures=Addresses+Served&properties=Address,City`,
  logic: (resp, {formatters}) => {
    const data = resp.data;

    const facilities_health_4 = data.length;

    const dataTop1 = data.filter((d: any) => d["Rank Facility"]*1 === 1);
    const dataTop2 = data.filter((d: any) => d["Rank Facility"]*1 === 2);
    const dataTop3 = data.filter((d: any) => d["Rank Facility"]*1 === 3);
    const dataTop4 = data.filter((d: any) => d["Rank Facility"]*1 === 4);
    const dataTop5 = data.filter((d: any) => d["Rank Facility"]*1 === 5);

    const top1FacilityName_health_4: any = dataTop1[0] ? dataTop1[0]["Facility"] : false;
    const top1FacilityAddress_health_4: any = dataTop1[0] ? dataTop1[0]["Address"] : false;
    const top1FacilityCity_health_4: any = dataTop1[0] ? dataTop1[0]["City"] : false;
    const top1FacilityTract_health_4: any = dataTop1[0] ? dataTop1[0]["Tract Facility"] : false;
    const top1HouseholdServed_health_4: any = dataTop1[0] ? dataTop1[0]["Addresses Served"] : false;

    const top2FacilityName_health_4: any = dataTop2[0] ? dataTop2[0]["Facility"] : false;
    const top2FacilityAddress_health_4: any = dataTop2[0] ? dataTop2[0]["Address"] : false;
    const top2FacilityCity_health_4: any = dataTop2[0] ? dataTop2[0]["City"] : false;
    const top2FacilityTract_health_4: any = dataTop2[0] ? dataTop2[0]["Tract Facility"] : false;
    const top2HouseholdServed_health_4: any = dataTop2[0] ? dataTop2[0]["Addresses Served"] : false;

    const top3FacilityName_health_4: any = dataTop3[0] ? dataTop3[0]["Facility"] : false;
    const top3FacilityAddress_health_4: any = dataTop3[0] ? dataTop3[0]["Address"] : false;
    const top3FacilityCity_health_4: any = dataTop3[0] ? dataTop3[0]["City"] : false;
    const top3FacilityTract_health_4: any = dataTop3[0] ? dataTop3[0]["Tract Facility"] : false;
    const top3HouseholdServed_health_4: any = dataTop3[0] ? dataTop3[0]["Addresses Served"] : false;

    const top4FacilityName_health_4: any = dataTop4[0] ? dataTop4[0]["Facility"] : false;
    const top4FacilityAddress_health_4: any = dataTop4[0] ? dataTop4[0]["Address"] : false;
    const top4FacilityCity_health_4: any = dataTop4[0] ? dataTop4[0]["City"] : false;
    const top4FacilityTract_health_4: any = dataTop4[0] ? dataTop4[0]["Tract Facility"] : false;
    const top4HouseholdServed_health_4: any = dataTop4[0] ? dataTop4[0]["Addresses Served"] : false;

    const top5FacilityName_health_4: any = dataTop5[0] ? dataTop5[0]["Facility"] : false;
    const top5FacilityAddress_health_4: any = dataTop5[0] ? dataTop5[0]["Address"] : false;
    const top5FacilityCity_health_4: any = dataTop5[0] ? dataTop5[0]["City"] : false;
    const top5FacilityTract_health_4: any = dataTop5[0] ? dataTop5[0]["Tract Facility"] : false;
    const top5HouseholdServed_health_4: any = dataTop5[0] ? dataTop5[0]["Addresses Served"] : false;

    return{
      facilities_health_4: formatters.commas(facilities_health_4),
  
      top1FacilityName_health_4,
      top1FacilityAddress_health_4,
      top1FacilityCity_health_4,
      top1FacilityTract_health_4,
      top1HouseholdServed_health_4: formatters.commas(top1HouseholdServed_health_4),
  
      top2FacilityName_health_4,
      top2FacilityAddress_health_4,
      top2FacilityCity_health_4,
      top2FacilityTract_health_4,
      top2HouseholdServed_health_4: formatters.commas(top2HouseholdServed_health_4),
  
      top3FacilityName_health_4,
      top3FacilityAddress_health_4,
      top3FacilityCity_health_4,
      top3FacilityTract_health_4,
      top3HouseholdServed_health_4: formatters.commas(top3HouseholdServed_health_4),
  
      top4FacilityName_health_4,
      top4FacilityAddress_health_4,
      top4FacilityCity_health_4,
      top4FacilityTract_health_4,
      top4HouseholdServed_health_4: formatters.commas(top4HouseholdServed_health_4),
  
      top5FacilityName_health_4,
      top5FacilityAddress_health_4,
      top5FacilityCity_health_4,
      top5FacilityTract_health_4,
      top5HouseholdServed_health_4: formatters.commas(top5HouseholdServed_health_4),

    }
  }
};

export default generator;
