// Converted from legacy canon_cms_generator #731 "Health Providers" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 731,
  name: "Health Providers",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=County:${attrs.id}&measures=Patient to Dentist Ratio, Patient to Primary Care Physician Ratio, Patient to Mental Health Provider Ratio, Other Primary Care Providers&drilldowns=County,Year&sort=Year.desc&filters=Patient+to+Primary+Care+Physician+Ratio.isnotnull`,
  logic: (resp, {libs, formatters, variables}) => {
    if (!resp.data.length || variables.id === "01000US") return {lastYearProviderCounty: false};
    const {growth, list} = formatters;
    const {nest} = libs.d3;
    const data = resp.data.filter((d: any) => d["Patient to Primary Care Physician Ratio"] !== null && d["Patient to Primary Care Physician Ratio"] > 0);

    const providers: any = [
      "Patient to Primary Care Physician Ratio",
      "Patient to Dentist Ratio",
      "Patient to Mental Health Provider Ratio",
      "Other Primary Care Providers"
    ];

    const lastYearProviderCounty = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYearProviderCounty*1 - 1
    const countyName: any = data[0] ? data[0]["County"] : false

    const lastData = data.filter((d: any) => d.Year*1 === lastYearProviderCounty*1)
    const prevData = data.filter((d: any) => d.Year*1 === prevYear*1)

    const PhysicianCurr: any = lastData[0] ? lastData[0]["Patient to Primary Care Physician Ratio"] : false
    const PhysicianPrev: any = prevData[0] ? prevData[0]["Patient to Primary Care Physician Ratio"] : false
    const PhysicianGrowth = prevData[0] ? ((PhysicianCurr - PhysicianPrev) /PhysicianPrev) * 100 : 0

    const DentistCurr: any = lastData[0] ? lastData[0]["Patient to Dentist Ratio"] : false
    const DentistPrev: any = prevData[0] ? prevData[0]["Patient to Dentist Ratio"] : false
    const DentistGrowth = prevData[0] ? ((DentistCurr - DentistPrev) /DentistPrev) * 100 : 0

    const MentalCurr: any = lastData[0] ? lastData[0]["Patient to Mental Health Provider Ratio"] : false
    const MentalPrev: any = prevData[0] ? prevData[0]["Patient to Mental Health Provider Ratio"] : false
    const MentalGrowth = prevData[0] ? ((MentalCurr - MentalPrev) /MentalPrev) * 100 : 0

    const PrimaryCurr: any = lastData[0] ? lastData[0]["Other Primary Care Providers"] : false
    const PrimaryPrev: any = prevData[0] ? prevData[0]["Other Primary Care Providers"] : false
    const PrimaryGrowth = prevData[0] ? ((PrimaryCurr - PrimaryPrev) /PrimaryPrev) * 100 : 0


    return{
      countyName,
      lastYearProviderCounty,
      PhysicianCurrCounty: PhysicianCurr,
      PhysicianPrevCounty: PhysicianPrev,
      PhysicianGrowthCounty: PhysicianGrowth,
      DentistCurrCounty: DentistCurr,
      DentistPrevCounty: DentistPrev,
      DentistGrowthCounty: DentistGrowth,
      MentalCurrCounty: MentalCurr,
      MentalPrevCounty: MentalPrev,
      MentalGrowthCounty: MentalGrowth,
      PrimaryCurrCounty: PrimaryCurr,
      PrimaryPrevCounty: PrimaryPrev,
      PrimaryGrowthCounty: PrimaryGrowth
    }

  }
};

export default generator;
