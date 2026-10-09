// Converted from legacy canon_cms_generator #54 "Freight Imports (Tonnage)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 54,
  name: "Freight Imports (Tonnage)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=dot_faf&Destination%20State=${attrs.id}&measures=Thousands Of Tons&drilldowns=Destination State,Year`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data;

    const direction: string = "Import";

    const {abbreviate, growth} = formatters;
    const {nest} = libs.d3;
    const {freightYear} = variables;

    const key: string = "Thousands Of Tons" //resp.sources[0].measures[0];
    const selfKey = direction === "Export" ? "Origin State" : "Destination State";
    const multiplier = key.includes("Millions") ? 1000000 : 1000;
    const value = key.includes("Dollar") ? "Dollar" : "Weight";
    const prefix = value === "Dollar" ? "$" : "";
    const suffix = value === "Weight" ? " tons" : "";

    if(data.length > 0){

      let data_ = data.sort((a: any, b: any) => b["Year"] - a["Year"])
  
      const latestYear = data_.find((d: any) => d["Year"] < freightYear+1).Year;
      const futureYear = data_[0].Year;
  
      const retObj: Record<string, any> = {
        [`freight${direction}${value}LatestYear`]: latestYear,
        [`freight${direction}${value}FutureYear`]: futureYear,
      };
  
      nest()
        .key((d: any) => d["Destination State ID"])
        .entries(data_)
        .forEach((group: any, i: any) => {
          const latest = group.values.find((d: any) => d.Year === latestYear);
          const future = group.values.find((d: any) => d.Year === futureYear);
          retObj[`freight${direction}${value}${i + 1}Name`] = latest["Destination State"];
          retObj[`freight${direction}${value}${i + 1}LatestValue`] = `${prefix}${abbreviate(latest[key] * multiplier)}${suffix}`;
          retObj[`freight${direction}${value}${i + 1}FutureValue`] = `${prefix}${abbreviate(future[key] * multiplier)}${suffix}`;
          retObj[`freight${direction}${value}${i + 1}Growth`] = growth({prev: latest[key], curr: future[key]});
        });
  
      return retObj;
    }
    else{
      return{
        freightImportWeight1Name: false
      }
    }
  }
};

export default generator;
