// Converted from legacy canon_cms_generator #522 "[Education] Tuition" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 522,
  name: "[Education] Tuition",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Sector,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=State+Tuition,State+Fee,Books+And+Supplies&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data = resp.data;
    const {abbreviate, salary} = formatters;

    if(data.length > 0){

      const lastYearTuition: any = data[0] ? data[0]["Year"] : false
  
      data.sort((a: any, b: any) => {return b["State Tuition"] > a["State Tuition"] ? 1 : -1})
      const topStateTuition: any = data[0]["State Tuition"] ? `${data[0]["Sector"]} (${salary(data[0]["State Tuition"])})` : false
  
      data.sort((a: any, b: any) => {return b["State Fee"] > a["State Fee"] ? 1 : -1})
      const topStateFee: any = data[0]["State Fee"] ? `${data[0]["Sector"]} (${salary(data[0]["State Fee"])})` : false
  
      data.sort((a: any, b: any) => {return b["Books And Supplies"] > a["Books And Supplies"] ? 1 : -1})
      const topStateBooks: any = data[0]["Books And Supplies"] ? `${data[0]["Sector"]} (${salary(data[0]["Books And Supplies"])})` : false
  
      return {
        lastYearTuition: lastYearTuition,
        topStateTuition: topStateTuition,
        topStateFee: topStateFee,
        topStateBooks: topStateBooks
      }
    }
    else{
      return{
        lastYearTuition: false
      }
    }
  }
};

export default generator;
