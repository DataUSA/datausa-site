// Converted from legacy canon_cms_generator #708 "[Health] Health Care" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 708,
  name: "[Health] Health Care",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Uninsured,Uninsured Adults,Uninsured Children,Other Primary Care Providers,Patient to Dentist Ratio,Patient to Primary Care Physician Ratio,Patient to Mental Health Provider Ratio,Preventable Hospital Stays,Mammography Screening&time=Year.isnotnull`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data;
    const {name} = variables;
    const {abbreviate, growthPct} = formatters;

    // 1.	Uninsured
    const dataUninsured = data.filter((d: any) => d["Uninsured"] >= 0 && d["Uninsured"] !== null)
    const lastYearUninsured: any = dataUninsured[0] ? libs.d3.max(dataUninsured, (d: any) => d.Year) : false
    const dataCurrUninsured = dataUninsured.filter((d: any) => d["Year"] === lastYearUninsured)
    const currRateUninsured: any = dataCurrUninsured[0] ? (dataCurrUninsured[0]["Uninsured"]) : false
    const textStateCountyHealthCare_indicator_1: any = dataCurrUninsured[0]  ? `In ${lastYearUninsured}, the percentage of population under age 65 without health insurance was ${growthPct(currRateUninsured*100)} in ${name}.` : false
    const len_indicator_1 = dataUninsured.length;

    // 2.	Uninsured Adults
    const dataAdults = data.filter((d: any) => d["Uninsured Adults"] >= 0 && d["Uninsured Adults"] !== null)
    const lastYearAdults: any = dataAdults[0] ? libs.d3.max(dataAdults, (d: any) => d.Year) : false
    const dataCurrAdults = dataAdults.filter((d: any) => d["Year"] === lastYearAdults)
    const currRateAdults: any = dataCurrAdults[0] ? (dataCurrAdults[0]["Uninsured Adults"]) : false
    const textStateCountyHealthCare_indicator_2: any = dataCurrAdults[0] ? `In ${lastYearAdults}, the percentage of adults under age 65 without health insurance was ${growthPct(currRateAdults*100)} in ${name}.` : false
    const len_indicator_2 = dataAdults.length;

    // 3.	Uninsured Children
    const dataChildren = data.filter((d: any) => d["Uninsured Children"] >= 0 && d["Uninsured Children"] !== null)
    const lastYearChildren: any = dataChildren[0] ? libs.d3.max(dataChildren, (d: any) => d.Year) : false
    const dataCurrChildren = dataChildren.filter((d: any) => d["Year"] === lastYearChildren)
    const currRateChildren: any = dataCurrChildren[0] ? (dataCurrChildren[0]["Uninsured Children"]) : false
    const textStateCountyHealthCare_indicator_3: any = dataCurrChildren[0] ? `In ${lastYearChildren}, the percentage of children under age 19 without health insurance was ${growthPct(currRateChildren*100)} in ${name}.` : false
    const len_indicator_3 = dataChildren.length;

    // 4.	Other Primary Care Providers
    const dataProviders = data.filter((d: any) => d["Other Primary Care Providers"] >= 0 && d["Other Primary Care Providers"] !== null)
    const lastYearProviders: any = dataProviders[0] ? libs.d3.max(dataProviders, (d: any) => d.Year) : false
    const dataCurrProviders = dataProviders.filter((d: any) => d["Year"] === lastYearProviders)
    const currRateProviders: any = dataCurrProviders[0] ? (dataCurrProviders[0]["Other Primary Care Providers"]) : false
    const textStateCountyHealthCare_indicator_4: any = dataCurrProviders[0] ? `In ${lastYearProviders}, the ratio of population to primary care providers other than physicians was ${abbreviate(currRateProviders)} in ${name}.` : false
    const len_indicator_4 = dataProviders.length;

    // 5.	Patient to Dentist Ratio
    const dataDentist = data.filter((d: any) => d["Patient to Dentist Ratio"] >= 0 && d["Patient to Dentist Ratio"] !== null)
    const lastYearDentist: any = dataDentist[0] ? libs.d3.max(dataDentist, (d: any) => d.Year) : false
    const dataCurrDentist = dataDentist.filter((d: any) => d["Year"] === lastYearDentist)
    const currRateDentist: any = dataCurrDentist[0] ? (dataCurrDentist[0]["Patient to Dentist Ratio"]) : false
    const textStateCountyHealthCare_indicator_5: any = dataCurrDentist[0] ? `In ${lastYearDentist}, the ratio of population to dentists was ${abbreviate(currRateDentist)} in ${name}.` : false
    const len_indicator_5 = dataDentist.length;

    // 6.	Patient to Primary Care Physician Ratio
    const dataPhysician = data.filter((d: any) => d["Patient to Primary Care Physician Ratio"] >= 0 && d["Patient to Primary Care Physician Ratio"] !== null)
    const lastYearPhysician: any = dataPhysician[0] ? libs.d3.max(dataPhysician, (d: any) => d.Year) : false
    const dataCurrPhysician = dataPhysician.filter((d: any) => d["Year"] === lastYearPhysician)
    const currRatePhysician: any = dataCurrPhysician[0] ? (dataCurrPhysician[0]["Patient to Primary Care Physician Ratio"]) : false
    const textStateCountyHealthCare_indicator_6: any = dataCurrPhysician[0] ? `In ${lastYearPhysician}, the ratio of population to primary care physicians was ${abbreviate(currRatePhysician)} in ${name}.` : false
    const len_indicator_6 = dataPhysician.length;

    // 7.	Patient to Mental Health Provider Ratio
    const dataMental = data.filter((d: any) => d["Patient to Mental Health Provider Ratio"] >= 0 && d["Patient to Mental Health Provider Ratio"] !== null)
    const lastYearMental: any = dataMental[0] ? libs.d3.max(dataMental, (d: any) => d.Year) : false
    const dataCurrMental = dataMental.filter((d: any) => d["Year"] === lastYearMental)
    const currRateMental: any = dataCurrMental[0] ? (dataCurrMental[0]["Patient to Mental Health Provider Ratio"]) : false
    const textStateCountyHealthCare_indicator_7: any = dataCurrMental[0] ? `In ${lastYearMental}, the ratio of population to mental health providers was ${abbreviate(currRateMental)} in ${name}.` : false
    const len_indicator_7 = dataMental.length;

    // 8.	Preventable Hospital Stays
    const dataHospital = data.filter((d: any) => d["Preventable Hospital Stays"] >= 0 && d["Preventable Hospital Stays"] !== null)
    const lastYearHospital: any = dataHospital[0] ? libs.d3.max(dataHospital, (d: any) => d.Year) : false
    const dataCurrHospital = dataHospital.filter((d: any) => d["Year"] === lastYearHospital)
    const currRateHospital: any = dataCurrHospital[0] ? (dataCurrHospital[0]["Preventable Hospital Stays"]) : false
    const textStateCountyHealthCare_indicator_8: any = dataCurrHospital[0] ? `In ${lastYearHospital}, the rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees was ${abbreviate(currRateHospital)} in ${name}.` : false
    const len_indicator_8 = dataHospital.length;

    // 9.	Mammography Screening
    const dataMammography = data.filter((d: any) => d["Mammography Screening"] >= 0 && d["Mammography Screening"] !== null)
    const lastYearMammography: any = dataMammography[0] ? libs.d3.max(dataMammography, (d: any) => d.Year) : false
    const dataCurrMammography = dataMammography.filter((d: any) => d["Year"] === lastYearMammography)
    const currRateMammography: any = dataCurrMammography[0] ? (dataCurrMammography[0]["Mammography Screening"]) : false
    const textStateCountyHealthCare_indicator_9: any = dataCurrMammography[0] ? `In ${lastYearMammography}, the percentage of female Medicare enrollees ages 65-74 that received an annual mammography screening was ${growthPct(currRateMammography*100)} in ${name}.` : false
    const len_indicator_9 = dataMammography.length;

    return {
      textStateCountyHealthCare_indicator_1,
      textStateCountyHealthCare_indicator_2,
      textStateCountyHealthCare_indicator_3,
      textStateCountyHealthCare_indicator_4,
      textStateCountyHealthCare_indicator_5,
      textStateCountyHealthCare_indicator_6,
      textStateCountyHealthCare_indicator_7,
      textStateCountyHealthCare_indicator_8,
      textStateCountyHealthCare_indicator_9,
  
      len_indicator_1,
      len_indicator_2,
      len_indicator_3,
      len_indicator_4,
      len_indicator_5,
      len_indicator_6,
      len_indicator_7,
      len_indicator_8,
      len_indicator_9,
  
    };
  }
};

export default generator;
