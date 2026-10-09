// Converted from legacy canon_cms_generator #667 "Household Income by Race" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 667,
  name: "Household Income by Race",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&measures=Household+Income+by+Race&drilldowns=Year,Race,${attrs.incomeDrilldown}&time=Year.latest${attrs.includeIncome}`,
  logic: (resp, {libs, variables}) => {
    let data: any;
    const {nest} = libs.d3;
    const {hierarchy, incomeDrilldown} = variables;
    const key: string = "Household Income by Race";

    if(resp.data > 0){

      if(hierarchy === "Place"){
        data.forEach((d: any) => {
          d.Tract = d.Tract.split(",")[0].trim();
        })
      }
  
      const retObj: Record<string, any> = {};
      nest()
        .key((d: any) => d["Race ID"])
        .entries(resp.data)
        .sort((a: any, b: any) => a["Race ID"] - b["Race ID"])
        .forEach((group: any) => {
          const id = group.key;
          group.values
            .sort((a: any, b: any) => b[key] - a[key])
            .slice(0, 3)
            .forEach((d: any, i: any) => {
              retObj[`incomeRace${d["Race ID"]}Child${i + 1}Name`] = d[incomeDrilldown];
              retObj[`incomeRace${d["Race ID"]}Child${i + 1}Value`] = d[key];
              retObj[`incomeRace${d["Race ID"]}Child${i + 1}Visible`] = d[key] ? true : false;
            });
        });
  
      return retObj;
    }
    else{
      return{
        incomeRace0Child1Visible: false,
      }
    }
  }
};

export default generator;
