// Converted from legacy canon_cms_generator #705 "[Health] Health Outcomes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 705,
  name: "[Health] Health Outcomes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=Year,State&measures=Child Mortality,Infant Mortality,Premature Age-Adjusted Mortality,Premature Death,Low Birthweight,Poor Mental Health Days,Poor Or Fair Health,Poor Physical Health Days,Frequent Mental Distress,Frequent Physical Distress,Diabetes Prevalence,Hiv Prevalence&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data = resp.data;
    const {abbreviate, growthPct, list} = formatters;

    const lastYearHealthOutcomes = data[0]["Year"]


    // 1.	Child Mortality
    data.sort((a: any, b: any) => b["Child Mortality"] > a["Child Mortality"] ? 1 : -1);
    const top3HealthOutcomes_indicator_1_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Child Mortality"])})`)
    const top3HealthOutcomes_indicator_1: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest number of deaths among residents under age 18 per 100,000 population were ${list(top3HealthOutcomes_indicator_1_list)}`


    // 2.	Infant Mortality
    data.sort((a: any, b: any) => b["Infant Mortality"] > a["Infant Mortality"] ? 1 : -1);
    const top3HealthOutcomes_indicator_2_text = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Infant Mortality"])})`)
    const top3HealthOutcomes_indicator_2: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest number of infant deaths (within 1 year) per 1,000 live births were ${list(top3HealthOutcomes_indicator_2_text)}`


    // 3.	Premature Death
    data.sort((a: any, b: any) => b["Premature Death"] > a["Premature Death"] ? 1 : -1);
    const top3HealthOutcomes_indicator_3_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Premature Death"])})`)
    const top3HealthOutcomes_indicator_3: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest years of potential life lost before age 75 per 100,000 population (age-adjusted) were ${list(top3HealthOutcomes_indicator_3_list)}`


    // 4.	Premature Age-Adjusted Mortality
    data.sort((a: any, b: any) => b["Premature Age-Adjusted Mortality"] > a["Premature Age-Adjusted Mortality"] ? 1 : -1);
    const top3HealthOutcomes_indicator_4_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Premature Age-Adjusted Mortality"])})`)
    const top3HealthOutcomes_indicator_4: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest number of deaths among residents under age 75 per 100,000 population (age-adjusted) were ${list(top3HealthOutcomes_indicator_4_list)}`


    // 5.	Low Birthweight
    data.sort((a: any, b: any) => b["Low Birthweight"] > a["Low Birthweight"] ? 1 : -1);
    const top3HealthOutcomes_indicator_5_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Low Birthweight"]*100)})`)
    const top3HealthOutcomes_indicator_5: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest percentage of live births with low birthweight (< 2,500 grams) were ${list(top3HealthOutcomes_indicator_5_list)}`


    // 6.	Poor Physical  Health Days
    data.sort((a: any, b: any) => b["Poor Physical Health Days"] > a["Poor Physical Health Days"] ? 1 : -1);
    const top3HealthOutcomes_indicator_6_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Poor Physical Health Days"])})`)
    const top3HealthOutcomes_indicator_6: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest average number of physically unhealthy days reported in past 30 days (age-adjusted) were ${list(top3HealthOutcomes_indicator_6_list)}`


    // 7.	Poor Mental  Health Days
    data.sort((a: any, b: any) => b["Poor Mental Health Days"] > a["Poor Mental Health Days"] ? 1 : -1);
    const top3HealthOutcomes_indicator_7_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Poor Mental Health Days"])})`)
    const top3HealthOutcomes_indicator_7: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest average number of mentally unhealthy days reported in past 30 days (age-adjusted) were ${list(top3HealthOutcomes_indicator_7_list)}`


    // 8.	Poor or Fair Health
    data.sort((a: any, b: any) => b["Poor Or Fair Health"] > a["Poor Or Fair Health"] ? 1 : -1);
    const top3HealthOutcomes_indicator_8_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Poor Or Fair Health"]*100)})`)
    const top3HealthOutcomes_indicator_8: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest percentage of adults reporting fair or poor health (age-adjusted) were ${list(top3HealthOutcomes_indicator_8_list)}`


    // 9.	Frequent Physical Distress
    data.sort((a: any, b: any) => b["Frequent Physical Distress"] > a["Frequent Physical Distress"] ? 1 : -1);
    const top3HealthOutcomes_indicator_9_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Frequent Physical Distress"]*100)})`)
    const top3HealthOutcomes_indicator_9: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest percentage of adults reporting 14 or more days of poor physical health per month (age-adjusted) were ${list(top3HealthOutcomes_indicator_9_list)}`


    // 10.	Frequent Mental Distress
    data.sort((a: any, b: any) => b["Frequent Mental Distress"] > a["Frequent Mental Distress"] ? 1 : -1);
    const top3HealthOutcomes_indicator_10_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Frequent Mental Distress"]*100)})`)
    const top3HealthOutcomes_indicator_10: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest percentage of adults reporting 14 or more days of poor mental health per month (age-adjusted) were ${list(top3HealthOutcomes_indicator_10_list)}`


    // 11.	Diabetes Prevalence
    data.sort((a: any, b: any) => b["Diabetes Prevalence"] > a["Diabetes Prevalence"] ? 1 : -1);
    const top3HealthOutcomes_indicator_11_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Diabetes Prevalence"]*100)})`)
    const top3HealthOutcomes_indicator_11: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest percentage of adults aged 20 and above with diagnosed diabetes (age-adjusted) were ${list(top3HealthOutcomes_indicator_11_list)}`


    // 12.	HIV Prevalence
    data.sort((a: any, b: any) => b["Hiv Prevalence"] > a["Hiv Prevalence"] ? 1 : -1);
    const top3HealthOutcomes_indicator_12_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Hiv Prevalence"])})`)
    const top3HealthOutcomes_indicator_12: string = `In ${lastYearHealthOutcomes}, the states in the United States with the highest number of people aged 13 years and older living with a diagnosis of human immunodeficiency virus (HIV) infection per 100,000 population were ${list(top3HealthOutcomes_indicator_12_list)}`


    return {
      lastYearHealthOutcomes,
      top3HealthOutcomes_indicator_1,
      top3HealthOutcomes_indicator_2,
      top3HealthOutcomes_indicator_3,
      top3HealthOutcomes_indicator_4,
      top3HealthOutcomes_indicator_5,
      top3HealthOutcomes_indicator_6,
      top3HealthOutcomes_indicator_7,
      top3HealthOutcomes_indicator_8,
      top3HealthOutcomes_indicator_9,
      top3HealthOutcomes_indicator_10,
      top3HealthOutcomes_indicator_11,
      top3HealthOutcomes_indicator_12,
    };
  }
};

export default generator;
