// Converted from legacy canon_cms_generator #424 "[Transport] Interstate" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 424,
  name: "[Transport] Interstate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=dot_faf&SCTG2=${attrs.sctg}&measures=Millions Of Dollars&drilldowns=Year,Origin State,Destination State&Year=${attrs.freightYear}`,
  logic: (resp, {libs}) => {
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;
    const measure: string = "Millions Of Dollars";

    if(resp.data.length > 0){
  
      const destids: Record<string, any> = {};
      resp.data.forEach((d: any) => {
        if (!destids[d["Destination State"]]) destids[d["Destination State"]] = d["Destination State ID"]
      });
      const origids: Record<string, any> = {};
      resp.data.forEach((d: any) => {
        if (!origids[d["Origin State"]]) origids[d["Origin State"]] = d["Origin State ID"]
      });
  
      const desturl = (d: any) => `<a href="/profile/geo/${destids[d]}">${d}</a>`;
      const origurl = (d: any) => `<a href="/profile/geo/${origids[d]}">${d}</a>`;
  
      const returnObj: Record<string, any> = {};
  
      returnObj[`yearOutbond`] = resp.data[0].Year;
      nest()
        .key((d: any) => d["Origin State ID"])
        .entries(resp.data)
        .forEach((group: any) => {
          const {key, values} = group;
          returnObj[`state${key}`] = values.find((d: any) => d["Origin State ID"] === key)["Origin State"];
          const data: any = [];
          nest()
            .key((d: any) => d["Destination State ID"])
            .entries(values.filter((d: any) => d["Destination State ID"] !== key))
            .forEach((prod: any) => {
              data.push(merge(prod.values));
            });
          data
            .sort((a: any, b: any) => b[measure] - a[measure])
            .slice(0, 3)
            .forEach((d: any, i: any) => {
              returnObj[`state${key}Dest${i + 1}Name`] = desturl(d["Destination State"]);
              returnObj[`state${key}Dest${i + 1}Value`] = d[measure] * 1000000;
            });
        });
    
      nest()
        .key((d: any) => d["Destination State ID"])
        .entries(resp.data)
        .forEach((group: any) => {
          const {key, values} = group;
          const data: any = [];
          nest()
            .key((d: any) => d["Origin State ID"])
            .entries(values.filter((d: any) => d["Origin State ID"] !== key))
            .forEach((prod: any) => {
              data.push(merge(prod.values));
            });
          data
            .sort((a: any, b: any) => b[measure] - a[measure])
            .slice(0, 3)
            .forEach((d: any, i: any) => {
              returnObj[`state${key}Origin${i + 1}Name`] = origurl(d["Origin State"]);
              returnObj[`state${key}Origin${i + 1}Value`] = d[measure] * 1000000;
            });
        });
  
      return returnObj;
    }
    else{
      return{
        stateOrigin1Name: false
      }
    }
  }
};

export default generator;
