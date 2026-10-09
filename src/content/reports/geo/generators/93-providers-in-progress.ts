// Converted from legacy canon_cms_generator #93 "Providers IN PROGRESS" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 93,
  name: "Providers IN PROGRESS",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=county_health_ranking&include=State:${attrs.stateDataID}&measures=Patient+to+Dentist+Ratio,Patient+to+Primary+Care+Physician+Ratio,Patient+to+Mental+Health+Provider+Ratio,Other+Primary+Care+Providers&drilldowns=Year,State&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    const {growth, list} = formatters;
    const {nest} = libs.d3;
    const data = resp.data;

    if(data.length > 0){

      const providers: any = [
        "Patient to Primary Care Physician Ratio",
        "Patient to Dentist Ratio",
        "Patient to Mental Health Provider Ratio",
        "Other Primary Care Providers"
      ];
  
      const retObj: Record<string, any> = {
        providerName: resp.data[0].State,
        providerYear: resp.data[0].Year,
        providerVisible: true,
      };
  
      providers.forEach((provider: any, i: any) => {
        retObj[`provider${i + 1}`] = provider;
        retObj[`provider${i + 1}Type`] = provider
          .replace("Patient to ", "")
          .replace(" Ratio", "")
          .replace(/([^s]$)/g, "$&s");
      });
  
      return retObj;
    }
    else{
      return{
        providerVisible: false
      }
    }
  }
};

export default generator;
