// Converted from legacy canon_cms_generator #701 "[Crimes] Indicator" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 701,
  name: "[Crimes] Indicator",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year&measures=Violent Crime,Injury Deaths,Homicides,Firearm Fatalities,Motor Vehicle Crash Deaths`,
  logic: (resp, {libs, formatters, variables}) => {
    const {declinedGrewWord, growthPct} = formatters;
    const {hierarchy} = variables;
    const data = resp.data;

    const isStateCounty = hierarchy === "County" || hierarchy === "State";

    //Violent Crimes
    const dataViolentCrimes = data.filter((d: any) => d["Violent Crime"])

    const lastYear_socialNeed_opt1: any = dataViolentCrimes[0] ? libs.d3.max(dataViolentCrimes, (d: any) => d.Year) : false
    const prevYear_socialNeed_opt1: any = dataViolentCrimes[dataViolentCrimes.length-1] ? libs.d3.min(dataViolentCrimes, (d: any) => d.Year) : false

    const dataCurr = dataViolentCrimes.filter((d: any) => d["Year"] === lastYear_socialNeed_opt1)
    const dataPrev = dataViolentCrimes.filter((d: any) => d["Year"] === prevYear_socialNeed_opt1)

    const currRate_socialNeed_opt1: any = dataCurr[0] ? (dataCurr[0]["Violent Crime"]) : false
    const prevRate_socialNeed_opt1: any = dataPrev[0] ? (dataPrev[0]["Violent Crime"]) : false

    const delta_socialNeed_opt1 =  Math.abs(currRate_socialNeed_opt1 - prevRate_socialNeed_opt1)
    const deltaWord_socialNeed_opt1 = declinedGrewWord(currRate_socialNeed_opt1 - prevRate_socialNeed_opt1)

    const len_socialNeed_opt1 = dataViolentCrimes.length;
    const textGrowth_socialNeed_opt1 = len_socialNeed_opt1 > 1 ? `From ${prevYear_socialNeed_opt1} to ${lastYear_socialNeed_opt1}, the indicator ${deltaWord_socialNeed_opt1} ${growthPct(delta_socialNeed_opt1)} per 100,000 population.` : "";


    //Injury Deaths
    const dataInjuryDeaths = data.filter((d: any) => d["Injury Deaths"])

    const lastYear_socialNeed_opt2: any = dataInjuryDeaths[0] ? libs.d3.max(dataInjuryDeaths, (d: any) => d.Year) : false
    const prevYear_socialNeed_opt2: any = dataInjuryDeaths[dataInjuryDeaths.length-1] ? libs.d3.min(dataInjuryDeaths, (d: any) => d.Year) : false

    const dataCurrID = dataInjuryDeaths.filter((d: any) => d["Year"] === lastYear_socialNeed_opt2)
    const dataPrevID = dataInjuryDeaths.filter((d: any) => d["Year"] === prevYear_socialNeed_opt2)

    const currRate_socialNeed_opt2: any = dataCurrID[0] ? (dataCurrID[0]["Injury Deaths"]) : false
    const prevRate_socialNeed_opt2: any = dataPrevID[0] ? (dataPrevID[0]["Injury Deaths"]) : false

    const delta_socialNeed_opt2 =  Math.abs(currRate_socialNeed_opt2 - prevRate_socialNeed_opt2)
    const deltaWord_socialNeed_opt2 = declinedGrewWord(currRate_socialNeed_opt2 - prevRate_socialNeed_opt2)

    const len_socialNeed_opt2 = dataInjuryDeaths.length;
    const textGrowth_socialNeed_opt2 = len_socialNeed_opt2 > 1 ? `From ${prevYear_socialNeed_opt2} to ${lastYear_socialNeed_opt2}, the indicator ${deltaWord_socialNeed_opt2} ${growthPct(delta_socialNeed_opt2)} per 100,000 population.` : "";

    //Homicides
    const dataHomicides = data.filter((d: any) => d["Homicides"])

    const lastYear_socialNeed_opt3: any = dataHomicides[0] ? libs.d3.max(dataHomicides, (d: any) => d.Year) : false
    const prevYear_socialNeed_opt3: any = dataHomicides[dataHomicides.length-1] ? libs.d3.min(dataHomicides, (d: any) => d.Year) : false

    const dataCurrHom = dataHomicides.filter((d: any) => d["Year"] === lastYear_socialNeed_opt3)
    const dataPrevHom = dataHomicides.filter((d: any) => d["Year"] === prevYear_socialNeed_opt3)

    const currRate_socialNeed_opt3: any = dataCurrHom[0] ? (dataCurrHom[0]["Homicides"]) : false
    const prevRate_socialNeed_opt3: any = dataPrevHom[0] ? (dataPrevHom[0]["Homicides"]): false

    const delta_socialNeed_opt3 =  Math.abs(currRate_socialNeed_opt3 - prevRate_socialNeed_opt3)
    const deltaWord_socialNeed_opt3 = declinedGrewWord(currRate_socialNeed_opt3 - prevRate_socialNeed_opt3)

    const len_socialNeed_opt3 = dataHomicides.length;
    const textGrowth_socialNeed_opt3 = len_socialNeed_opt3 > 1 ? `From ${prevYear_socialNeed_opt3} to ${lastYear_socialNeed_opt3}, the indicator ${deltaWord_socialNeed_opt3} ${growthPct(delta_socialNeed_opt3)} per 100,000 population.` : "";

    //Firearm Fatalities
    const dataFirearm = data.filter((d: any) => d["Firearm Fatalities"])

    const lastYear_socialNeed_opt4: any = dataFirearm[0] ? libs.d3.max(dataFirearm, (d: any) => d.Year) : false
    const prevYear_socialNeed_opt4: any = dataFirearm[dataFirearm.length-1] ? libs.d3.min(dataFirearm, (d: any) => d.Year) : false

    const dataCurrFire = dataFirearm.filter((d: any) => d["Year"] === lastYear_socialNeed_opt4)
    const dataPrevFire = dataFirearm.filter((d: any) => d["Year"] === prevYear_socialNeed_opt4)

    const currRate_socialNeed_opt4: any = dataCurrFire[0] ? (dataCurrFire[0]["Firearm Fatalities"]) : false
    const prevRate_socialNeed_opt4: any = dataPrevFire[0] ? (dataPrevFire[0]["Firearm Fatalities"]) : false

    const delta_socialNeed_opt4 =  Math.abs(currRate_socialNeed_opt4 - prevRate_socialNeed_opt4)
    const deltaWord_socialNeed_opt4 = declinedGrewWord(currRate_socialNeed_opt4 - prevRate_socialNeed_opt4)

    const len_socialNeed_opt4 = dataFirearm.length;
    const textGrowth_socialNeed_opt4 = len_socialNeed_opt4 > 1 ? `From ${prevYear_socialNeed_opt4} to ${lastYear_socialNeed_opt4}, the indicator ${deltaWord_socialNeed_opt4} ${growthPct(delta_socialNeed_opt4)} per 100,000 population.` : "";

    //Motor Vehicle Crash Deaths
    const dataVehicle = data.filter((d: any) => d["Motor Vehicle Crash Deaths"])

    const lastYear_socialNeed_opt5: any = dataVehicle[0] ? libs.d3.max(dataVehicle, (d: any) => d.Year) : false
    const prevYear_socialNeed_opt5: any = dataVehicle[dataVehicle.length-1] ? libs.d3.min(dataVehicle, (d: any) => d.Year) : false

    const dataCurrVehicle = dataVehicle.filter((d: any) => d["Year"] === lastYear_socialNeed_opt5)
    const dataPrevVehicle = dataVehicle.filter((d: any) => d["Year"] === prevYear_socialNeed_opt5)

    const currRate_socialNeed_opt5: any = dataCurrVehicle[0] ? (dataCurrVehicle[0]["Motor Vehicle Crash Deaths"]) : false
    const prevRate_socialNeed_opt5: any = dataPrevVehicle[0] ? (dataPrevVehicle[0]["Motor Vehicle Crash Deaths"]) : false

    const delta_socialNeed_opt5 =  Math.abs(currRate_socialNeed_opt5 - prevRate_socialNeed_opt5)
    const deltaWord_socialNeed_opt5 = declinedGrewWord(currRate_socialNeed_opt5 - prevRate_socialNeed_opt5)

    const len_socialNeed_opt5 = dataVehicle.length;
    const textGrowth_socialNeed_opt5 = len_socialNeed_opt5 > 1 ? `From ${prevYear_socialNeed_opt5} to ${lastYear_socialNeed_opt5}, the indicator ${deltaWord_socialNeed_opt5} ${growthPct(delta_socialNeed_opt5)} per 100,000 population.` : "";

    const visibleCrimeSection = currRate_socialNeed_opt1 || currRate_socialNeed_opt2 || currRate_socialNeed_opt3 || currRate_socialNeed_opt4 || currRate_socialNeed_opt5;

    return {
      visibleCrimeSection,
      lastYear_socialNeed_opt1: isStateCounty ? lastYear_socialNeed_opt1 : false,
      prevYear_socialNeed_opt1,
      currRate_socialNeed_opt1,
      delta_socialNeed_opt1,
      deltaWord_socialNeed_opt1,
      len_socialNeed_opt1,
      textGrowth_socialNeed_opt1,
  
      lastYear_socialNeed_opt2: isStateCounty ? lastYear_socialNeed_opt2 : false,
      prevYear_socialNeed_opt2,
      currRate_socialNeed_opt2,
      delta_socialNeed_opt2,
      deltaWord_socialNeed_opt2,
      len_socialNeed_opt2,
      textGrowth_socialNeed_opt2,
  
      lastYear_socialNeed_opt3: isStateCounty ? lastYear_socialNeed_opt3 : false,
      prevYear_socialNeed_opt3,
      currRate_socialNeed_opt3,
      delta_socialNeed_opt3,
      deltaWord_socialNeed_opt3,
      len_socialNeed_opt3,
      textGrowth_socialNeed_opt3,
  
      lastYear_socialNeed_opt4: isStateCounty ? lastYear_socialNeed_opt4 : false,
      prevYear_socialNeed_opt4,
      currRate_socialNeed_opt4,
      delta_socialNeed_opt4,
      deltaWord_socialNeed_opt4,
      len_socialNeed_opt4,
      textGrowth_socialNeed_opt4,
  
      lastYear_socialNeed_opt5: isStateCounty ? lastYear_socialNeed_opt5 : false,
      prevYear_socialNeed_opt5,
      currRate_socialNeed_opt5,
      delta_socialNeed_opt5,
      deltaWord_socialNeed_opt5,
      len_socialNeed_opt5,
      textGrowth_socialNeed_opt5,
    };
  }
};

export default generator;
