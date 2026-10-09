// Converted from legacy canon_cms_generator #730 "Health Providers" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 730,
  name: "Health Providers",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=State:${attrs.stateDataID}&measures=Patient to Dentist Ratio, Patient to Primary Care Physician Ratio, Patient to Mental Health Provider Ratio, Other Primary Care Providers&drilldowns=State,Year,Patient to Dentist Ratio Data Source Years,Patient to Primary Care Physician Ratio Data Source Years,Patient to Mental Health Provider Ratio Data Source Years,Other Primary Care Providers Data Source Years&sort=Year.desc`,
  logic: (resp, {libs, formatters, variables}) => {
    if (!resp.data.length || variables.id === "01000US") return {lastYearProvider: false};
    const {growth, list} = formatters;
    const {nest} = libs.d3;
    const {hierarchy} = variables;

    const data = resp.data;

    const providers: any = [
      "Patient to Primary Care Physician Ratio",
      "Patient to Dentist Ratio",
      "Patient to Mental Health Provider Ratio",
      "Other Primary Care Providers"
    ];

    const lastYearProvider: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false;
    const prevYear: any = lastYearProvider ? lastYearProvider*1 - 1 : false;
    const stateName: any = data[0] ? data[0]["State"] : false

    const lastData = data.filter((d: any) => d.Year*1 === lastYearProvider*1)
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
      stateName,
      lastYearProvider,
      prevYear,
      PhysicianCurr,
      PhysicianPrev,
      PhysicianGrowth,
      DentistCurr,
      DentistPrev,
      DentistGrowth,
      MentalCurr,
      MentalPrev,
      MentalGrowth,
      PrimaryCurr,
      PrimaryPrev,
      PrimaryGrowth
    }

    /*
    const retObj: Record<string, any> = {
      providerGeoIDs: Array.from(new Set(data.map((d: any) => d[`${hierarchy} ID`]))),
      providerGeoNames: list(Array.from(new Set(data.map((d: any) => d[hierarchy])))),
      providerYear: data[0].Year
    };

    providers.forEach((provider: any, i: any) => {
      retObj[`provider${i + 1}`] = provider;
      retObj[`provider${i + 1}Type`] = provider
        .replace("Patient to ", "")
        .replace(" Ratio", "")
        .replace(/([^s]$)/g, "$&s");
    });

    nest()
      .key((d: any) => d[`${hierarchy} ID`])
      .entries(data)
      .forEach((group: any, ii: any) => {
        retObj[`provider${ii + 1}GeoID`] = group.key;
        retObj[`provider${ii + 1}GeoName`] = `${group.key === "01000US" ? "the " : ""}${group.values[0].hierarchy}`;
        providers.forEach((provider: any, i: any) => {
          const curr = group.values[0][provider];
          const prev = group.values[1][provider];
          retObj[`provider${i + 1}_${ii + 1}Curr`] = curr;
          retObj[`provider${i + 1}_${ii + 1}Prev`] = prev;
          retObj[`provider${i + 1}_${ii + 1}Growth`] = growth({curr, prev});
          retObj[`provider${i + 1}_${ii + 1}CurrYear`] = group.values[0][`${provider} Data Source Years`];
          retObj[`provider${i + 1}_${ii + 1}PrevYear`] = group.values[1][`${provider} Data Source Years`];
        });
      });

    return retObj;*/
  }
};

export default generator;
