// Converted from legacy canon_cms_generator #525 "[Education] Graduates" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 525,
  name: "[Education] Graduates",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&time=Year.latest`,
  logic: (resp, {libs}) => {
    const data = resp.data;
    const {max} = libs.d3;

    if (data.length > 0){ 

      const lastYearUnivDegrees: any = data[0] ? max(data, (d: any) => d.Year) : false
      const dataLastYear = data.filter((d: any) => d["Year"] === lastYearUnivDegrees)
  
      return {
        ipedsGradsCurr: dataLastYear[0] ? dataLastYear[0].Completions: false,
        ipedsGradsCurrYear: lastYearUnivDegrees
      }
    }
    else{
      return{
        ipedsGradsCurrYear: false
      }
    }
  }
};

export default generator;
