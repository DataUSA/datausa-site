// Converted from legacy canon_cms_generator #425 "[Transport] Transportation Mode" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 425,
  name: "[Transport] Transportation Mode",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=dot_faf&SCTG2=${attrs.sctg}&measures= Thousands%20Of%20Tons&drilldowns=Year, Transportation%20Mode&Year=${attrs.freightYear}`,
  logic: (resp, {libs}) => {
    const {nest, sum} = libs.d3;

    if(resp.data.length > 0){

      const data: any = [];
      nest()
        .key((d: any) => d["Transportation Mode"])
        .entries(resp.data)
        .forEach((group: any) => {
          const {key, values} = group;
          data.push({name: key, value: sum(values, (d: any) => d["Thousands Of Tons"])});
        });
  
      const returnObj: Record<string, any> = {transportYear: resp.data[0].Year};
      data.sort((a: any, b: any) => b.value - a.value).slice(0, 3)
        .forEach((d: any, i: any) => {
          returnObj[`transport${i + 1}Name`] = d.name;
          returnObj[`transport${i + 1}Value`] = d.value * 1000;
        });
  
      return returnObj;
    }
    else{
      return{
        transportYear: false
      }
    }
  }
};

export default generator;
