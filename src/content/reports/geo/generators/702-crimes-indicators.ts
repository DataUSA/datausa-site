// Converted from legacy canon_cms_generator #702 "[Crimes] Indicators" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 702,
  name: "[Crimes] Indicators",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&drilldowns=Year,State&measures=Violent Crime,Injury Deaths,Homicides,Firearm Fatalities,Motor Vehicle Crash Deaths&filters=Trade+Value.isnotnull&time=Year.isnotnull`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;
    const {abbreviate} = formatters;

    const lastYearSec_socialNeed_opt1 = libs.d3.max(data.filter((d: any) => d["Violent Crime"]), (d: any) => d.Year)
    const dataCrime =  data.filter((d: any) => d["Violent Crime"] && d.Year === lastYearSec_socialNeed_opt1)
    dataCrime.sort((a: any, b: any) => b["Violent Crime"] > a["Violent Crime"] ? 1 : -1);
    const top3Crimes_socialNeed_opt1 = dataCrime.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Violent Crime"])})`)


    const lastYearSec_socialNeed_opt2 = libs.d3.max(data.filter((d: any) => d["Injury Deaths"]), (d: any) => d.Year)
    const dataViolent =  data.filter((d: any) => d["Injury Deaths"] && d.Year === lastYearSec_socialNeed_opt2)
    dataViolent.sort((a: any, b: any) => b["Injury Deaths"] > a["Injury Deaths"] ? 1 : -1);
    const top3Crimes_socialNeed_opt2 = dataViolent.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Injury Deaths"])})`)


    const lastYearSec_socialNeed_opt3 = libs.d3.max(data.filter((d: any) => d["Homicides"]), (d: any) => d.Year)
    const dataHomicides =  data.filter((d: any) => d["Homicides"] && d.Year === lastYearSec_socialNeed_opt3)
    dataHomicides.sort((a: any, b: any) => b["Homicides"] > a["Homicides"] ? 1 : -1);
    const top3Crimes_socialNeed_opt3 = dataHomicides.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Homicides"])})`)


    const lastYearSec_socialNeed_opt4 = libs.d3.max(data.filter((d: any) => d["Firearm Fatalities"]), (d: any) => d.Year)
    const dataFatalities =  data.filter((d: any) => d["Firearm Fatalities"] && d.Year === lastYearSec_socialNeed_opt4)
    dataFatalities.sort((a: any, b: any) => b["Firearm Fatalities"] > a["Firearm Fatalities"] ? 1 : -1);
    const top3Crimes_socialNeed_opt4 = dataFatalities.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Firearm Fatalities"])})`)


    const lastYearSec_socialNeed_opt5 = libs.d3.max(data.filter((d: any) => d["Motor Vehicle Crash Deaths"]), (d: any) => d.Year)
    const dataVehicle =  data.filter((d: any) => d["Motor Vehicle Crash Deaths"] && d.Year === lastYearSec_socialNeed_opt5)
    dataVehicle.sort((a: any, b: any) => b["Motor Vehicle Crash Deaths"] > a["Motor Vehicle Crash Deaths"] ? 1 : -1);
    const top3Crimes_socialNeed_opt5 = dataVehicle.slice(0, 3).map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${abbreviate(d["Motor Vehicle Crash Deaths"])})`)


    return {
      lastYearSec_socialNeed_opt1,
      top3Crimes_socialNeed_opt1,
      lastYearSec_socialNeed_opt2,
      top3Crimes_socialNeed_opt2,
      lastYearSec_socialNeed_opt3,
      top3Crimes_socialNeed_opt3,
      lastYearSec_socialNeed_opt4,
      top3Crimes_socialNeed_opt4,
      lastYearSec_socialNeed_opt5,
      top3Crimes_socialNeed_opt5 
    };
  }
};

export default generator;
