// Converted from legacy canon_cms_generator #115 "Freight Export Partners (Dollars)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 115,
  name: "Freight Export Partners (Dollars)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Origin+State=${attrs.id}&Year=${attrs.freightYear}&cube=dot_faf&drilldowns=Destination+State,Origin State&measures=Millions+Of+Dollars&sort=Millions Of Dollars.desc`,
  logic: (resp, {libs, formatters}) => {
    if (!resp.data.length) return {freightName: false};

    const {abbreviate, list} = formatters;
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const multiplier = 1000000;
    const value: string = "Dollar";
    const prefix = value === "Dollar" ? "$" : "";
    const suffix = value === "Weight" ? " tons" : "";

    const sources = Array.from(new Set(resp.data.map((d: any) => d[`Origin State ID`])));

    const retObj: Record<string, any> = {
      freightName: list(Array.from(new Set(resp.data.map((d: any) => d["Origin State"])))),
      freightIDs: Array.from(new Set(resp.data.map((d: any) => d["Origin State ID"])))
    };

    nest()
      .key((d: any) => d[`Destination State ID`])
      .entries(resp.data.filter((d: any) => !sources.includes(d[`Destination State ID`])))
      .map((group: any) => merge(group.values))
      .sort((a: any, b: any) => b["Millions Of Dollars"] - a["Millions Of Dollars"])
      .slice(0, 3)
      .forEach((data: any, i: any) => {
        retObj[`freightExportDollarState${i + 1}Name`] = `<a href="/profile/geo/${data[`Destination State ID`]}">${data["Destination State"]}</a>`;
        retObj[`freightExportDollarState${i + 1}Value`] = `${prefix}${abbreviate(data["Millions Of Dollars"] * multiplier)}`;
      });

    return retObj;

  }
};

export default generator;
