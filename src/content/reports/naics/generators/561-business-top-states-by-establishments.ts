// Converted from legacy canon_cms_generator #561 "[Business] Top states by establishments" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 561,
  name: "[Business] Top states by establishments",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=State,Year&include=Industry:${attrs.blsIdsStr}&locale=en&measures=Number+of+Establishments&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;
    const {commas} = formatters;
    const {max} = libs.d3;

    const lastYearEstablishments: any = data[0] ? max(data, (d: any) => d["Year"]) : false

    if (lastYearEstablishments){
      const lastData = data.filter((d: any) => d["Year"] === lastYearEstablishments);
  
      lastData.sort((a: any, b: any) => {return b["Number of Establishments"] > a["Number of Establishments"] ? 1 : -1})
  
  
      const establishmentState1: string = `<a href="/profile/geo/${lastData[0]["Slug State"] || lastData[0]["State ID"]}">${lastData[0]["State"]}</a>`
      const establishmentStateValue1 =  lastData[0]["Number of Establishments"]
  
      const establishmentState2: string = `<a href="/profile/geo/${lastData[1]["Slug State"] || lastData[1]["State ID"]}">${lastData[1]["State"]}</a>`
      const establishmentStateValue2 =  lastData[1]["Number of Establishments"]
  
      const establishmentState3: string = `<a href="/profile/geo/${lastData[2]["Slug State"] || lastData[2]["State ID"]}">${lastData[2]["State"]}</a>`
      const establishmentStateValue3 =  lastData[2]["Number of Establishments"]
  
      const top2EstablishmentState = lastData.slice(0,2).map((d: any, i: any) => `${d["State"]}`)
  
      return {
        lastYearEstablishments,
        establishmentState1,
        establishmentStateValue1,
        establishmentState2,
        establishmentStateValue2,
        establishmentState3,
        establishmentStateValue3,
        top2EstablishmentState
      }
    }

    else{
      return{
        lastYearEstablishments
      }
    }
  }
};

export default generator;
