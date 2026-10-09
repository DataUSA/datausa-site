// Converted from legacy canon_cms_generator #707 "[Health] Health Behaviors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 707,
  name: "[Health] Health Behaviors",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=State,Year&measures=Access To Exercise Opportunities Data Source,Adult Obesity,Access To Exercise Opportunities,Food Environment Index,Food Insecurity,Limited Access To Healthy Foods,Physical Inactivity,Adult Smoking,Drug Overdose Deaths,Excessive Drinking,Alcohol-Impaired Driving Deaths&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data = resp.data;
    const {abbreviate, growthPct, list} = formatters;

    const lastYearHealthBehavior = data[0]["Year"]


    // 1.	Adult Obesity
    data.sort((a: any, b: any) => b["Adult Obesity"] > a["Adult Obesity"] ? 1 : -1);
    const top3HealthBehavior_indicator_1_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Adult Obesity"]*100)})`)
    const top3HealthBehavior_indicator_1: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of the adult population (age 18 and older) that reports a body mass index (BMI) greater than or equal to 30 kg/m2 (age-adjusted) were ${list(top3HealthBehavior_indicator_1_list)}`


    // 2.	Access To Exercise Opportunities
    data.sort((a: any, b: any) => b["Access To Exercise Opportunities"] > a["Access To Exercise Opportunities"] ? 1 : -1);
    const top3HealthBehavior_indicator_2_text = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Access To Exercise Opportunities"]*100)})`)
    const top3HealthBehavior_indicator_2: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of population with adequate access to locations for physical activity were ${list(top3HealthBehavior_indicator_2_text)}`


    // 3.	Food Environment Index
    data.sort((a: any, b: any) => b["Food Environment Index"] > a["Food Environment Index"] ? 1 : -1);
    const top3HealthBehavior_indicator_3_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Food Environment Index"])})`)
    const top3HealthBehavior_indicator_3: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest index of factors that contribute to a healthy food environment (from 0-worst to 10-best) were ${list(top3HealthBehavior_indicator_3_list)}`


    // 4.	Food Insecurity
    data.sort((a: any, b: any) => b["Food Insecurity"] > a["Food Insecurity"] ? 1 : -1);
    const top3HealthBehavior_indicator_4_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Food Insecurity"]*100)})`)
    const top3HealthBehavior_indicator_4: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of population who lack adequate access to food were ${list(top3HealthBehavior_indicator_4_list)}`


    // 5.	Limited Access To Healthy Foods
    data.sort((a: any, b: any) => b["Limited Access To Healthy Foods"] > a["Limited Access To Healthy Foods"] ? 1 : -1);
    const top3HealthBehavior_indicator_5_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Limited Access To Healthy Foods"]*100)})`)
    const top3HealthBehavior_indicator_5: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of population who are low-income and do not live close to a grocery store were ${list(top3HealthBehavior_indicator_5_list)}`


    // 6.	Physical Inactivity
    data.sort((a: any, b: any) => b["Physical Inactivity"] > a["Physical Inactivity"] ? 1 : -1);
    const top3HealthBehavior_indicator_6_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Physical Inactivity"]*100)})`)
    const top3HealthBehavior_indicator_6: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of adults age 18 and over reporting no leisure-time physical activity (age-adjusted) were ${list(top3HealthBehavior_indicator_6_list)}`


    // 7.	Adult Smoking
    data.sort((a: any, b: any) => b["Adult Smoking"] > a["Adult Smoking"] ? 1 : -1);
    const top3HealthBehavior_indicator_7_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Adult Smoking"]*100)})`)
    const top3HealthBehavior_indicator_7: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of adults who are current smokers (age-adjusted) were ${list(top3HealthBehavior_indicator_7_list)}`


    // 8.	Drug Overdose Deaths
    data.sort((a: any, b: any) => b["Drug Overdose Deaths"] > a["Drug Overdose Deaths"] ? 1 : -1);
    const top3HealthBehavior_indicator_8_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Drug Overdose Deaths"])})`)
    const top3HealthBehavior_indicator_8: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest number of drug poisoning deaths per 100,000 population were ${list(top3HealthBehavior_indicator_8_list)}`


    // 9.	Excessive Drinking
    data.sort((a: any, b: any) => b["Excessive Drinking"] > a["Excessive Drinking"] ? 1 : -1);
    const top3HealthBehavior_indicator_9_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Excessive Drinking"]*100)})`)
    const top3HealthBehavior_indicator_9: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of adults reporting binge or heavy drinking (age-adjusted) were ${list(top3HealthBehavior_indicator_9_list)}`


    // 10.	Alcohol-Impaired Driving Deaths
    data.sort((a: any, b: any) => b["Alcohol-Impaired Driving Deaths"] > a["Alcohol-Impaired Driving Deaths"] ? 1 : -1);
    const top3HealthBehavior_indicator_10_list = data.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${growthPct(d["Alcohol-Impaired Driving Deaths"]*100)})`)
    const top3HealthBehavior_indicator_10: string = `In ${lastYearHealthBehavior}, the states in the United States with the highest percentage of driving deaths with alcohol involvement were ${list(top3HealthBehavior_indicator_10_list)}`



    return {
      lastYearHealthBehavior,
      top3HealthBehavior_indicator_1,
      top3HealthBehavior_indicator_2,
      top3HealthBehavior_indicator_3,
      top3HealthBehavior_indicator_4,
      top3HealthBehavior_indicator_5,
      top3HealthBehavior_indicator_6,
      top3HealthBehavior_indicator_7,
      top3HealthBehavior_indicator_8,
      top3HealthBehavior_indicator_9,
      top3HealthBehavior_indicator_10
    };
  }
};

export default generator;
