// Converted from legacy canon_cms_generator #8 "Household Income (Race)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 8,
  name: "Household Income (Race)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&include=${attrs.hierarchy}:${attrs.id}&measures=Household%20Income%20by%20Race&drilldowns=Year,Race&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"]*1 === currYear*1);

    const incomeRaceSelector: any = [];
    data.reduce((a: any, b: any) => {
        let key = b["Race ID"];
          if (!a[key]) {
            a[key] = {"option": `incomeRace${b["Race ID"]}`, 
                      "label": b["Race"]
            };
            incomeRaceSelector.push(a[key]);
      }
      return a
    }, {});

    const incomeRaceDefault = incomeRaceSelector[0] ? incomeRaceSelector[0].option : "incomeRace0"; 

    return {
      incomeRaceSelector,
      incomeRaceDefault,
    }
  }
};

export default generator;
