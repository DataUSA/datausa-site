// Converted from legacy canon_cms_generator #706 "[Health] Health Behavior" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 706,
  name: "[Health] Health Behavior",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Access To Exercise Opportunities Data Source,Adult Obesity,Access To Exercise Opportunities,Food Environment Index,Food Insecurity,Limited Access To Healthy Foods,Physical Inactivity,Adult Smoking,Drug Overdose Deaths,Excessive Drinking,Alcohol-Impaired Driving Deaths&time=Year.isnotnull`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data;
    const {name} = variables;
    const {abbreviate, growthPct} = formatters;

    const lastYearHealthBehavior_: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false

    // 1.	Adult Obesity
    const dataObesity = data.filter((d: any) => d["Adult Obesity"] >= 0 && d["Adult Obesity"] !== null)
    const lastYearObesity: any = dataObesity[0] ? libs.d3.max(dataObesity, (d: any) => d.Year) : false
    const dataCurrObesity = dataObesity.filter((d: any) => d["Year"] === lastYearObesity)
    const currRateObesity: any = dataCurrObesity[0] ? (dataCurrObesity[0]["Adult Obesity"]) : false
    const textStateCountyHealthBehavior_indicator_1: any = dataCurrObesity[0] ? `In ${lastYearObesity}, the percentage of the adult population (age 18 and older) that reports a body mass index (BMI) greater than or equal to 30 kg/m2 (age-adjusted)  was ${growthPct(currRateObesity*100)} in ${name}.` : false


    // 2.	Access To Exercise Opportunities
    const dataExercise = data.filter((d: any) => d["Access To Exercise Opportunities"] >= 0 && d["Access To Exercise Opportunities"] !== null)
    const lastYearExercise: any = dataExercise[0] ? libs.d3.max(dataExercise, (d: any) => d.Year) : false
    const dataCurrExercise = dataExercise.filter((d: any) => d["Year"] === lastYearExercise)
    const currRateExercise: any = dataCurrExercise[0] ? (dataCurrExercise[0]["Access To Exercise Opportunities"]) : false
    const textStateCountyHealthBehavior_indicator_2: any = (dataCurrExercise[0] && currRateExercise !== 0) ? `In ${lastYearExercise}, the percentage of population with adequate access to locations for physical activity was ${growthPct(currRateExercise*100)} in ${name}.` : false


    // 3.	Food Environment Index
    const dataIndex = data.filter((d: any) => d["Food Environment Index"] >= 0 && d["Food Environment Index"] !== null)
    const lastYearIndex: any = dataIndex[0] ? libs.d3.max(dataIndex, (d: any) => d.Year) : false
    const dataCurrIndex = dataIndex.filter((d: any) => d["Year"] === lastYearIndex)
    const currRateIndex: any = dataCurrIndex[0] ? (dataCurrIndex[0]["Food Environment Index"]) : false
    const textStateCountyHealthBehavior_indicator_3: any = dataCurrIndex[0] ? `In ${lastYearIndex}, the index of factors that contribute to a healthy food environment (from 0-worst to 10-best) was ${abbreviate(currRateIndex)} in ${name}.` : false


    // 4.	Food Insecurity
    const dataFood = data.filter((d: any) => d["Food Insecurity"] >= 0 && d["Food Insecurity"] !== null)
    const lastYearFood: any = dataFood[0] ? libs.d3.max(dataFood, (d: any) => d.Year) : false
    const dataCurrFood = dataFood.filter((d: any) => d["Year"] === lastYearFood)
    const currRateFood: any = dataCurrFood[0] ? (dataCurrFood[0]["Food Insecurity"]) : false
    const textStateCountyHealthBehavior_indicator_4: any = dataCurrFood[0] ? `In ${lastYearFood}, the percentage of population who lack adequate access to food was ${growthPct(currRateFood*100)} in ${name}.` : false


    // 5.	Limited Access To Healthy Foods
    const dataLimit = data.filter((d: any) => d["Limited Access To Healthy Foods"] >= 0 && d["Limited Access To Healthy Foods"] !== null)
    const lastYearLimit: any = dataLimit[0] ? libs.d3.max(dataLimit, (d: any) => d.Year) : false
    const dataCurrLimit = dataLimit.filter((d: any) => d["Year"] === lastYearLimit)
    const currRateLimit: any = dataCurrLimit[0] ? (dataCurrLimit[0]["Limited Access To Healthy Foods"]) : false
    const textStateCountyHealthBehavior_indicator_5: any = (dataCurrLimit[0] && currRateLimit !== 0) ? `In ${lastYearLimit}, the percentage of population who are low-income and do not live close to a grocery store was ${growthPct(currRateLimit*100)} in ${name}.` : false


    // 6.	Physical Inactivity
    const dataPhysical = data.filter((d: any) => d["Physical Inactivity"] >= 0 && d["Physical Inactivity"] !== null)
    const lastYearPhysical: any = dataPhysical[0] ? libs.d3.max(dataPhysical, (d: any) => d.Year) : false
    const dataCurrPhysical = dataPhysical.filter((d: any) => d["Year"] === lastYearPhysical)
    const currRatePhysical: any = dataCurrPhysical[0] ? (dataCurrPhysical[0]["Physical Inactivity"]) : false
    const textStateCountyHealthBehavior_indicator_6: any = dataCurrPhysical[0] ? `In ${lastYearPhysical}, the percentage of adults age 18 and over reporting no leisure-time physical activity (age-adjusted) was ${growthPct(currRatePhysical*100)} in ${name}.` : false


    // 7.	Adult Smoking
    const dataSmoking = data.filter((d: any) => d["Adult Smoking"] >= 0 && d["Adult Smoking"] !== null)
    const lastYearSmoking: any = dataSmoking[0] ? libs.d3.max(dataSmoking, (d: any) => d.Year) : false
    const dataCurrSmoking = dataSmoking.filter((d: any) => d["Year"] === lastYearSmoking)
    const currRateSmoking: any = dataCurrSmoking[0] ? (dataCurrSmoking[0]["Adult Smoking"]) : false
    const textStateCountyHealthBehavior_indicator_7: any = dataCurrSmoking[0] ? `In ${lastYearSmoking}, the percentage of adults who are current smokers (age-adjusted) was ${growthPct(currRateSmoking*100)} in ${name}.` : false


    // 8.	Drug Overdose Deaths
    const dataDrugs = data.filter((d: any) => d["Drug Overdose Deaths"] >= 0 && d["Drug Overdose Deaths"] !== null)
    const lastYearDrugs: any = dataDrugs[0] ? libs.d3.max(dataDrugs, (d: any) => d.Year) : false
    const dataCurrDrugs = dataDrugs.filter((d: any) => d["Year"] === lastYearDrugs)
    const currRateDrugs: any = dataCurrDrugs[0] ? (dataCurrDrugs[0]["Drug Overdose Deaths"]) : false
    const textStateCountyHealthBehavior_indicator_8: any = dataCurrDrugs[0] ? `In ${lastYearDrugs}, the number of drug poisoning deaths per 100,000 population was ${abbreviate(currRateDrugs)} in ${name}.` : false


    // 9.	Excessive Drinking
    const dataDrinking = data.filter((d: any) => d["Excessive Drinking"] >= 0 && d["Excessive Drinking"] !== null)
    const lastYearDrinking: any = dataDrinking[0] ? libs.d3.max(dataDrinking, (d: any) => d.Year) : false
    const dataCurrDrinking = dataDrinking.filter((d: any) => d["Year"] === lastYearDrinking)
    const currRateDrinking: any = dataCurrDrinking[0] ? (dataCurrDrinking[0]["Excessive Drinking"]) : false
    const textStateCountyHealthBehavior_indicator_9: any = dataCurrDrinking[0] ? `In ${lastYearDrinking}, the percentage of adults reporting binge or heavy drinking (age-adjusted) was ${growthPct(currRateDrinking*100)} in ${name}.` : false


    // 10.	Alcohol-Impaired Driving Deaths
    const dataAlcohol = data.filter((d: any) => d["Alcohol-Impaired Driving Deaths"] >= 0 && d["Alcohol-Impaired Driving Deaths"] !== null)
    const lastYearAlcohol: any = dataAlcohol[0] ? libs.d3.max(dataAlcohol, (d: any) => d.Year) : false
    const dataCurrAlcohol = dataAlcohol.filter((d: any) => d["Year"] === lastYearAlcohol)
    const currRateAlcohol: any = dataCurrAlcohol[0] ? (dataCurrAlcohol[0]["Alcohol-Impaired Driving Deaths"]) : false
    const textStateCountyHealthBehavior_indicator_10: any = dataCurrAlcohol[0] ? `In ${lastYearAlcohol}, the percentage of driving deaths with alcohol involvement was ${growthPct(currRateAlcohol*100)} in ${name}.` : false



    return {
      lastYearHealthBehavior_,
      textStateCountyHealthBehavior_indicator_1,
      textStateCountyHealthBehavior_indicator_2,
      textStateCountyHealthBehavior_indicator_3,
      textStateCountyHealthBehavior_indicator_4,
      textStateCountyHealthBehavior_indicator_5,
      textStateCountyHealthBehavior_indicator_6,
      textStateCountyHealthBehavior_indicator_7,
      textStateCountyHealthBehavior_indicator_8,
      textStateCountyHealthBehavior_indicator_9,
      textStateCountyHealthBehavior_indicator_10
    };
  }
};

export default generator;
