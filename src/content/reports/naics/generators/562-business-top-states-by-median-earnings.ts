// Converted from legacy canon_cms_generator #562 "[Business] Top states by median earnings" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 562,
  name: "[Business] Top states by median earnings",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/acs.jsonrecords?cube=acs_ygi_industry_for_median_earnings_5&drilldowns=Industry+Group,Year,State&measures=Median%20Earnings%20by%20Industry&locale=en&parents=false&time=Year.latest&exclude=Industry+Group:0`,
  logic: (resp, {formatters, variables}) => {
    const data = resp.data;
    const {commas} = formatters;
    const {id} = variables;

    const ids: Record<string, any> = {
      "11-21": "1",
      "23": "2",
      "31-33": "3",
      "42": "4",
      "44-45": "5",
      "48-49, 22": "6",
      "51": "7",
      "52-53": "8",
      "54-56": "9",
      "61-62": "10",
      "71-72": "11",
      "81": "13",
      "92": "14",
    }

    const acsID = ids[id];
    const dataIndustry = data.filter((d: any) => d["Industry Group ID"].toString() === acsID);

    if(dataIndustry.length > 0){
  
      const lastYearEarnings: any = data[0] ? data[0]["Year"] : undefined;
  
      dataIndustry.sort((a: any, b: any) => {return b["Median Earnings by Industry"] > a["Median Earnings by Industry"] ? 1 : -1})
  
      const earningsState1: string = `<a href="/profile/geo/${dataIndustry[0]["State ID"]}">${dataIndustry[0]["State"]}</a>`
      const earningsStateValue1 =  dataIndustry[0]["Median Earnings by Industry"]
  
      const earningsState2: string = `<a href="/profile/geo/${dataIndustry[1]["State ID"]}">${dataIndustry[1]["State"]}</a>`
      const earningsStateValue2 =  dataIndustry[1]["Median Earnings by Industry"]
  
      const earningsState3: string = `<a href="/profile/geo/${dataIndustry[2]["State ID"]}">${dataIndustry[2]["State"]}</a>`
      const earningsStateValue3 =  dataIndustry[2]["Median Earnings by Industry"]
  
      return {
        lastYearEarnings,
        earningsState1,
        earningsStateValue1,
        earningsState2,
        earningsStateValue2,
        earningsState3,
        earningsStateValue3
      };
    }
    else{
      return{
        lastYearEarnings: false,
      }
    }
  }
};

export default generator;
