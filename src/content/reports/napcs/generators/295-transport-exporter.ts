// Converted from legacy canon_cms_generator #295 "[Transport] Exporter" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 295,
  name: "[Transport] Exporter",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=dot_faf&SCTG2=${attrs.sctg}&measures=Millions Of Dollars&drilldowns=Year,Origin State,SCTG2&sort=Millions Of Dollars.desc`,
  logic: (resp, {libs, formatters, variables}) => {
    const {freightYear} = variables;
    const {nest, sum} = libs.d3;
    const {merge} = libs.d3plus;
    const {growth} = formatters;
    const measure: string = "Millions Of Dollars";
    const state: string = "Origin State";

    const data = resp.data;

    if(data.length > 0){
  
      data.forEach((d: any) => {
        d["Year ID"] = d["Year"] * 1
        d["Year"] = `${d["Year"]}`
      });
  
      const years = Array.from(new Set(data.map((d: any) => d["Year ID"]))).sort((a: any, b: any) => b - a);
      const latestYear = years.find((year: any) => year <= freightYear);
      const latestData = data.filter((d: any) => d["Year ID"] === latestYear)
  
      const ids: Record<string, any> = {};
      data.forEach((d: any) => {
        if (!ids[d["Origin State"]]) ids[d["Origin State"]] = d["Origin State ID"];
      })
      const url = (d: any) => `<a href="/profile/geo/${ids[d]}">${d}</a>`;
  
      const topData: any = [];
  
      nest()
        .key((d: any) => d["Origin State"])
        .entries(latestData)
        .forEach((group: any) => {
          topData.push({state: group.key, value: sum(group.values, (d: any) => d[measure])});
        });
  
      topData.sort((a: any, b: any) => b.value - a.value);
  
      const allData: any = [];
  
      nest()
        .key((d: any) => `${d[state]}_${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const obj = merge(group.values);
          delete obj["Year ID"];
          delete obj["SCTG2"];
          delete obj["SCTG2 ID"];
          allData.push(obj);
        });
  
  
      const returnObj: Record<string, any> = {
        exporterYear: latestData[0].Year,
        exportData: allData
      };
  
      topData.slice(0, 3).forEach((state: any, i: any) => {
        returnObj[`exporter${i + 1}Name`] = state.state;
        returnObj[`exporter${i + 1}Value`] = state.value * 1000000;
      });
  
      const topState = returnObj.exporter1Name;
      const futureData = data.filter((d: any) => d["Year ID"] === years[0] && d[state] === topState);
      returnObj.topExporter = `state${futureData[0][`${state} ID`]}`;
      const futureValue = sum(futureData, (d: any) => d[measure]) * 1000000;
  
      returnObj.exporterFutureValue = futureValue;
      returnObj.exporterFutureYear = years[0];
      returnObj.exporterGrowth = growth({curr: futureValue, prev: returnObj.exporter1Value});
  
      returnObj.exporter1NameStat = returnObj.exporter1Name;
  
      [0, 1, 2].forEach((i: any) => {
        returnObj[`exporter${i + 1}Name`] = url(returnObj[`exporter${i + 1}Name`])
      })
  
      return returnObj;
    }
    else{
      return{
        exporterYear: false
      }
    }
  }
};

export default generator;
