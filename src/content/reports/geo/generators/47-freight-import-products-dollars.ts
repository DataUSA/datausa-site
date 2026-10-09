// Converted from legacy canon_cms_generator #47 "Freight Import Products (Dollars)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 47,
  name: "Freight Import Products (Dollars)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Destination State=${attrs.id}&cube=dot_faf&measures=Millions Of Dollars&drilldowns=SCTG2&sort=Millions%20Of%20Dollars.desc&Year=${attrs.freightYear}`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;

    const direction: string = "Import";
    const output: string = "Product";

    const {abbreviate} = formatters;
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const key: string = "Millions Of Dollars"//resp.sources[0].measures[0];
    const multiplier = key.includes("Millions") ? 1000000 : 1000;
    const value = key.includes("Dollar") ? "Dollar" : "Weight";
    const prefix = value === "Dollar" ? "$" : "";
    const suffix = value === "Weight" ? " tons" : "";
    const outputKey = output === "State" ? direction === "Import" ? "Origin State" : "Destination State" : "SCTG2";
    const profile = output === "Product" ? "sctg" : "geo";

    const retObj: Record<string, any> = {};

    if(data.length > 0){

      nest()
        .key((d: any) => d[`${outputKey} ID`])
        .entries(data)
        .map((group: any) => merge(group.values))
        .sort((a: any, b: any) => b[key] - a[key])
        .slice(0, 3)
        .forEach((data: any, i: any) => {
          retObj[`freight${direction}${value}Product${i + 1}Name`] = `<a href="/profile/${profile}/${data[`${outputKey} ID`]}">${data[outputKey]}</a>`;
          retObj[`freight${direction}${value}Product${i + 1}Value`] = `${prefix}${abbreviate(data[key] * multiplier)}${suffix}`;
        });
  
      return retObj;
    }
    else{
      return{
        freightImportDollarProduct1Name: false
      }
    }
  }
};

export default generator;
