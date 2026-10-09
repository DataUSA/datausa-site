// Converted from legacy canon_cms_generator #55 "Freight Export Partners (Tonnage)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 55,
  name: "Freight Export Partners (Tonnage)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Origin+State=${attrs.id}&Year=${attrs.freightYear}&cube=dot_faf&drilldowns=Destination+State,Origin+State,Year&measures=Thousands+Of+Tons`,
  logic: (resp, {libs, formatters}) => {

    const data = resp.data;

    const direction: string = "Export";
    const output: string = "State";

    const {abbreviate} = formatters;
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const key: string = "Thousands Of Tons";
    const multiplier = 1000;
    const value: string = "Weight";
    const prefix = value === "Dollar" ? "$" : "";
    const suffix = value === "Weight" ? " tons" : "";
    const outputKey = output === "State" ? direction === "Import" ? "Origin State" : "Destination State" : "SCTG2";
    const profile: string = "geo";

    const retObj: Record<string, any> = {};

    if(data.length > 0){
      const sourceKey = direction === "Export" ? "Origin State" : "Destination State";
      const sources = Array.from(new Set(data.map((d: any) => d[`${sourceKey} ID`])));
  
      nest()
        .key((d: any) => d[`${outputKey} ID`])
        .entries(data.filter((d: any) => !sources.includes(d[`${outputKey} ID`])))
        .map((group: any) => merge(group.values))
        .sort((a: any, b: any) => b[key] - a[key])
        .slice(0, 3)
        .forEach((data: any, i: any) => {
          retObj[`freight${direction}${value}${output}${i + 1}Name`] = `<a href="/profile/${profile}/${data[`${outputKey} ID`]}">${data[outputKey]}</a>`;
          retObj[`freight${direction}${value}${output}${i + 1}Value`] = `${prefix}${abbreviate(data[key] * multiplier)}${suffix}`;
        });
  
      return retObj;
    }
    else{
      return{
        freightImportDollarStateName: false
      }
    }

  }
};

export default generator;
