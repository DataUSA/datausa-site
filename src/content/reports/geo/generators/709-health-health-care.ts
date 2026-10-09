// Converted from legacy canon_cms_generator #709 "[Health] Health Care" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 709,
  name: "[Health] Health Care",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=Year,State&measures=Uninsured,Uninsured Adults,Uninsured Children,Other Primary Care Providers,Patient to Dentist Ratio,Patient to Primary Care Physician Ratio,Patient to Mental Health Provider Ratio,Preventable Hospital Stays,Mammography Screening&time=year.latest`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;
    const {abbreviate, growthPct, list} = formatters;

    const lastYearHealthCare = libs.d3.max(data, (d: any) => d.Year)


    // 1.	Uninsured
    data.sort((a: any, b: any) => b["Uninsured"] > a["Uninsured"] ? 1 : -1);
    const top3HealthCare_indicator_1_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Uninsured"]*100)})`)
    const top3HealthCare_indicator_1: string = `In ${lastYearHealthCare}, the states in the United States with the highest percentage of population under age 65 without health insurance were ${list(top3HealthCare_indicator_1_list)}`


    // 2.	Uninsured Adults
    data.sort((a: any, b: any) => b["Uninsured Adults"] > a["Uninsured Adults"] ? 1 : -1);
    const top3HealthCare_indicator_2_text = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Uninsured Adults"]*100)})`)
    const top3HealthCare_indicator_2: string = `In ${lastYearHealthCare}, the states in the United States with the highest percentage of adults under age 65 without health insurance were ${list(top3HealthCare_indicator_2_text)}`


    // 3.	Uninsured Children
    data.sort((a: any, b: any) => b["Uninsured Children"] > a["Uninsured Children"] ? 1 : -1);
    const top3HealthCare_indicator_3_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Uninsured Children"]*100)})`)
    const top3HealthCare_indicator_3: string = `In ${lastYearHealthCare}, the states in the United States with the highest percentage of children under age 19 without health insurance were ${list(top3HealthCare_indicator_3_list)}`


    // 4.	Other Primary Care Providers
    data.sort((a: any, b: any) => b["Other Primary Care Providers"] > a["Other Primary Care Providers"] ? 1 : -1);
    const top3HealthCare_indicator_4_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Other Primary Care Providers"])})`)
    const top3HealthCare_indicator_4: string = `In ${lastYearHealthCare}, the states in the United States with the highest ratio of population to primary care providers other than physicians were ${list(top3HealthCare_indicator_4_list)}`


    // 5.	Patient to Dentist Ratio
    data.sort((a: any, b: any) => b["Patient to Dentist Ratio"] > a["Patient to Dentist Ratio"] ? 1 : -1);
    const top3HealthCare_indicator_5_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Patient to Dentist Ratio"])})`)
    const top3HealthCare_indicator_5: string = `In ${lastYearHealthCare}, the states in the United States with the highest ratio of population to dentists were ${list(top3HealthCare_indicator_5_list)}`


    // 6.	Patient to Primary Care Physician Ratio
    data.sort((a: any, b: any) => b["Patient to Primary Care Physician Ratio"] > a["Patient to Primary Care Physician Ratio"] ? 1 : -1);
    const top3HealthCare_indicator_6_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Patient to Primary Care Physician Ratio"])})`)
    const top3HealthCare_indicator_6: string = `In ${lastYearHealthCare}, the states in the United States with the highest ratio of population to primary care physicians were ${list(top3HealthCare_indicator_6_list)}`


    // 7.	Patient to Mental Health Provider Ratio
    data.sort((a: any, b: any) => b["Patient to Mental Health Provider Ratio"] > a["Patient to Mental Health Provider Ratio"] ? 1 : -1);
    const top3HealthCare_indicator_7_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Patient to Mental Health Provider Ratio"])})`)
    const top3HealthCare_indicator_7: string = `In ${lastYearHealthCare}, the states in the United States with the highest ratio of population to mental health providers were ${list(top3HealthCare_indicator_7_list)}`


    // 8.	Preventable Hospital Stays
    data.sort((a: any, b: any) => b["Preventable Hospital Stays"] > a["Preventable Hospital Stays"] ? 1 : -1);
    const top3HealthCare_indicator_8_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Preventable Hospital Stays"])})`)
    const top3HealthCare_indicator_8: string = `In ${lastYearHealthCare}, the states in the United States with the highest rate of hospital stays for ambulatory-care sensitive conditions per 100,000 Medicare enrollees were ${list(top3HealthCare_indicator_8_list)}`


    // 9.	Mammography Screening
    data.sort((a: any, b: any) => b["Mammography Screening"] > a["Mammography Screening"] ? 1 : -1);
    const top3HealthCare_indicator_9_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Mammography Screening"]*100)})`)
    const top3HealthCare_indicator_9: string = `In ${lastYearHealthCare}, the states in the United States with the highest percentage of female Medicare enrollees ages 65-74 that received an annual mammography screening were ${list(top3HealthCare_indicator_9_list)}`



    return {
      top3HealthCare_indicator_1,
      top3HealthCare_indicator_2,
      top3HealthCare_indicator_3,
      top3HealthCare_indicator_4,
      top3HealthCare_indicator_5,
      top3HealthCare_indicator_6,
      top3HealthCare_indicator_7,
      top3HealthCare_indicator_8,
      top3HealthCare_indicator_9
    };
  }
};

export default generator;
