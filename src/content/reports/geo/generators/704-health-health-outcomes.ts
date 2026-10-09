// Converted from legacy canon_cms_generator #704 "[Health] Health Outcomes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 704,
  name: "[Health] Health Outcomes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Child Mortality,Infant Mortality,Premature Age-Adjusted Mortality,Premature Death,Low Birthweight,Poor Mental Health Days,Poor Or Fair Health,Poor Physical Health Days,Frequent Mental Distress,Frequent Physical Distress,Diabetes Prevalence,Hiv Prevalence&time=Year.isnotnull`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data;
    const {name} = variables;
    const {abbreviate, growthPct} = formatters;

    const lastYearHealthOutcomes_: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false


    // 1.	Child Mortality
    const dataChildMortality = data.filter((d: any) => d["Child Mortality"])
    const lastYearChildMortality: any = dataChildMortality[0] ? libs.d3.max(dataChildMortality, (d: any) => d.Year) : false
    const dataCurrChildMortality = dataChildMortality.filter((d: any) => d["Year"] === lastYearChildMortality)
    const currRateChildMortality: any = dataCurrChildMortality[0] ? (dataCurrChildMortality[0]["Child Mortality"]) : false
    const textStateCountyHealthOutcomes_indicator_1: any = dataCurrChildMortality[0] ? `In ${lastYearChildMortality}, the number of deaths among residents under age 18 per 100,000 population was ${abbreviate(currRateChildMortality)} in ${name}.` : false


    // 2.	Infant Mortality
    const dataInfantMortality = data.filter((d: any) => d["Infant Mortality"])
    const lastYearInfantMortality: any = dataInfantMortality[0] ? libs.d3.max(dataInfantMortality, (d: any) => d.Year) : false
    const dataCurrInfantMortality = dataInfantMortality.filter((d: any) => d["Year"] === lastYearInfantMortality)
    const currRateInfantMortality: any = dataCurrInfantMortality[0] ? (dataCurrInfantMortality[0]["Infant Mortality"]) : false
    const textStateCountyHealthOutcomes_indicator_2: any = dataCurrInfantMortality[0] ? `In ${lastYearInfantMortality}, the number of infant deaths (within 1 year) per 1,000 live births was ${abbreviate(currRateInfantMortality)} in ${name}.` : false


    // 3.	Premature Death
    const dataPremature = data.filter((d: any) => d["Premature Death"])
    const lastYearPremature: any = dataPremature[0] ? libs.d3.max(dataPremature, (d: any) => d.Year) : undefined
    const dataCurrPremature = dataPremature.filter((d: any) => d["Year"] === lastYearPremature)
    const currRatePremature: any = dataCurrPremature[0] ? (dataCurrPremature[0]["Premature Death"]) : false
    const textStateCountyHealthOutcomes_indicator_3: any = dataCurrPremature[0] ? `In ${lastYearPremature}, the years of potential life lost before age 75 per 100,000 population (age-adjusted) was ${abbreviate(currRatePremature)} in ${name}.` : false


    // 4.	Premature Age-Adjusted Mortality
    const dataPrematureAdjusted = data.filter((d: any) => d["Premature Age-Adjusted Mortality"])
    const lastYearPrematureAdjusted: any = dataPrematureAdjusted[0] ? libs.d3.max(dataPrematureAdjusted, (d: any) => d.Year) : undefined
    const dataCurrPrematureAdjusted = dataPrematureAdjusted.filter((d: any) => d["Year"] === lastYearPrematureAdjusted)
    const currRatePrematureAdjusted: any = dataCurrPrematureAdjusted[0] ? (dataCurrPrematureAdjusted[0]["Premature Age-Adjusted Mortality"]) : false
    const textStateCountyHealthOutcomes_indicator_4: any = dataCurrPrematureAdjusted[0] ? `In ${lastYearPrematureAdjusted}, the number of deaths among residents under age 75 per 100,000 population (age-adjusted) was ${abbreviate(currRatePrematureAdjusted)} in ${name}.` : false


    // 5.	Low Birthweight
    const dataLow = data.filter((d: any) => d["Low Birthweight"])
    const lastYearLow: any = dataLow[0] ? libs.d3.max(dataLow, (d: any) => d.Year) : undefined
    const dataCurrLow = dataLow.filter((d: any) => d["Year"] === lastYearLow)
    const currRateLow: any = dataCurrLow[0] ? (dataCurrLow[0]["Low Birthweight"]) : false
    const textStateCountyHealthOutcomes_indicator_5: any = dataCurrLow[0] ? `In ${lastYearLow}, the percentage of live births with low birthweight (< 2,500 grams) was ${growthPct(currRateLow*100)} in ${name}.` : false


    // 6.	Poor Physical  Health Days
    const dataPoorPhysical = data.filter((d: any) => d["Poor Physical Health Days"])
    const lastYearPoorPhysical: any = dataPoorPhysical[0] ? libs.d3.max(dataPoorPhysical, (d: any) => d.Year) : false
    const dataCurrPoorPhysical = dataPoorPhysical.filter((d: any) => d["Year"] === lastYearPoorPhysical)
    const currRatePoorPhysical: any = dataCurrPoorPhysical[0] ? (dataCurrPoorPhysical[0]["Poor Physical Health Days"]) : false
    const textStateCountyHealthOutcomes_indicator_6: any = dataCurrPoorPhysical[0] ? `In ${lastYearPoorPhysical}, the average number of physically unhealthy days reported in past 30 days (age-adjusted) was ${abbreviate(currRatePoorPhysical)} in ${name}.` : false


    // 7.	Poor Mental  Health Days
    const dataPoorMental = data.filter((d: any) => d["Poor Mental Health Days"])
    const lastYearPoorMental: any = dataPoorMental[0] ? libs.d3.max(dataPoorMental, (d: any) => d.Year) : false
    const dataCurrPoorMental = dataPoorMental.filter((d: any) => d["Year"] === lastYearPoorMental)
    const currRatePoorMental: any = dataCurrPoorMental[0] ? (dataCurrPoorMental[0]["Poor Mental Health Days"]) : false
    const textStateCountyHealthOutcomes_indicator_7: any = dataCurrPoorMental[0] ? `In ${lastYearPoorMental}, the average number of mentally unhealthy days reported in past 30 days (age-adjusted) was ${abbreviate(currRatePoorMental)} in ${name}.` : false


    // 8.	Poor or Fair Health
    const dataPoorFair = data.filter((d: any) => d["Poor Or Fair Health"])
    const lastYearPoorFair: any = dataPoorFair[0] ? libs.d3.max(dataPoorFair, (d: any) => d.Year) : false
    const dataCurrPoorFair = dataPoorFair.filter((d: any) => d["Year"] === lastYearPoorFair)
    const currRatePoorFair: any = dataCurrPoorFair[0] ? (dataCurrPoorFair[0]["Poor Or Fair Health"]) : false
    const textStateCountyHealthOutcomes_indicator_8: any = dataCurrPoorFair[0] ? `In ${lastYearPoorFair}, the percentage of adults reporting fair or poor health (age-adjusted) was ${growthPct(currRatePoorFair*100)} in ${name}.` : false


    // 9.	Frequent Physical Distress
    const dataPhysicalDistress = data.filter((d: any) => d["Frequent Physical Distress"])
    const lastYearPhysicalDistress: any = dataPhysicalDistress[0] ? libs.d3.max(dataPhysicalDistress, (d: any) => d.Year) : false
    const dataCurrPhysicalDistress = dataPhysicalDistress.filter((d: any) => d["Year"] === lastYearPhysicalDistress)
    const currRatePhysicalDistress: any = dataCurrPhysicalDistress[0] ? (dataCurrPhysicalDistress[0]["Frequent Physical Distress"]) : false
    const textStateCountyHealthOutcomes_indicator_9: any = dataCurrPhysicalDistress[0] ? `In ${lastYearPhysicalDistress}, the percentage of adults reporting 14 or more days of poor physical health per month (age-adjusted) was ${growthPct(currRatePhysicalDistress*100)} in ${name}.` : false


    // 10.	Frequent Mental Distress
    const dataMentalDistress = data.filter((d: any) => d["Frequent Mental Distress"] )
    const lastYearMentalDistress: any = dataMentalDistress[0] ? libs.d3.max(dataMentalDistress, (d: any) => d.Year) : false
    const dataCurrMentalDistress = dataMentalDistress.filter((d: any) => d["Year"] === lastYearMentalDistress)
    const currRateMentalDistress: any = dataCurrMentalDistress[0] ? (dataCurrMentalDistress[0]["Frequent Mental Distress"]) : false
    const textStateCountyHealthOutcomes_indicator_10: any = dataCurrMentalDistress[0] ? `In ${lastYearMentalDistress}, the percentage of adults reporting 14 or more days of poor mental health per month (age-adjusted) was ${growthPct(currRateMentalDistress*100)} in ${name}.` : false


    // 11.	Diabetes Prevalence
    const dataDiabetes = data.filter((d: any) => d["Diabetes Prevalence"])
    const lastYearDiabetes: any = dataDiabetes[0] ? libs.d3.max(dataDiabetes, (d: any) => d.Year) : false
    const dataCurrDiabetes = dataDiabetes.filter((d: any) => d["Year"] === lastYearDiabetes)
    const currRateDiabetes: any = dataCurrDiabetes[0] ? (dataCurrDiabetes[0]["Diabetes Prevalence"]) : false
    const textStateCountyHealthOutcomes_indicator_11: any = dataCurrDiabetes[0] ? `In ${lastYearDiabetes}, the percentage of adults aged 20 and above with diagnosed diabetes (age-adjusted) was ${growthPct(currRateDiabetes*100)} in ${name}.` : false


    // 12.	HIV Prevalence
    const dataHIV = data.filter((d: any) => d["Hiv Prevalence"])
    const lastYearHIV: any = dataHIV[0] ? libs.d3.max(dataHIV, (d: any) => d.Year) : undefined
    const dataCurrHIV = dataHIV.filter((d: any) => d["Year"] === lastYearHIV)
    const currRateHIV: any = dataCurrHIV[0] ? (dataCurrHIV[0]["Hiv Prevalence"]) : false
    const textStateCountyHealthOutcomes_indicator_12: any = dataCurrHIV[0] ? `In ${lastYearHIV}, the number of people aged 13 years and older living with a diagnosis of human immunodeficiency virus (HIV) infection per 100,000 population was ${abbreviate(currRateHIV)} in ${name}.` : false


    return {
      lastYearHealthOutcomes_,
      textStateCountyHealthOutcomes_indicator_1,
      textStateCountyHealthOutcomes_indicator_2,
      textStateCountyHealthOutcomes_indicator_3,
      textStateCountyHealthOutcomes_indicator_4,
      textStateCountyHealthOutcomes_indicator_5,
      textStateCountyHealthOutcomes_indicator_6,
      textStateCountyHealthOutcomes_indicator_7,
      textStateCountyHealthOutcomes_indicator_8,
      textStateCountyHealthOutcomes_indicator_9,
      textStateCountyHealthOutcomes_indicator_10,
      textStateCountyHealthOutcomes_indicator_11,
      textStateCountyHealthOutcomes_indicator_12,
    };
  }
};

export default generator;
