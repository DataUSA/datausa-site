// Converted from legacy canon_cms_generator #650 "Household Income" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 650,
  name: "Household Income",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygr_median_household_income_race_5&measures=Household+Income+by+Race,Household+Income+by+Race+Moe&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year`,
  logic: (resp, {libs, formatters}) => {
    const measure: string = "Household Income by Race";

    const data = resp.data.filter((d: any) => d["Household Income by Race"]);

    if(data.length > 0){
  
      const maxYear = libs.d3.max(data, (d: any) => d.Year)
      const prevYear = maxYear - 1
  
      const lastData = data.filter((d: any) => d.Year === maxYear)
      const prevData = data.filter((d: any) => d.Year === prevYear)
  
      const curr = lastData[0][measure];
      const currMoe: any = lastData[0] ? lastData[0][`${measure} Moe`] : false;
      const currYear = lastData[0]["Year"];
  
      const retObj: Record<string, any> = {
        incomeCurr: curr,
        incomeCurrMOE: currMoe && currMoe !== null ? currMoe : false,
        incomeCurrYear: currYear,
        incomeGrowthMOE: false,
        incomeGrowth: false
      };
  
      if (prevData.length > 0) {
        const prev: any = prevData[0] ? prevData[0][measure] : false;
        const prevMoe = prevData[0][`${measure} Moe`];
        const prevYear = prevData[0]["Year"];
    
        retObj.incomePrev = prev;
        retObj.incomePrevMOE = prevMoe;
        retObj.incomePrevYear = prevYear;
        retObj.incomeGrowth = formatters.growth({curr, prev});
        retObj.incomeGrowthMOE = prev ? formatters.growth({curr, prev, currMoe, prevMoe}) : false;
      }
  
      const key: string = "incomeGrowth";
      const {growthPct, growthWord} = formatters;
      retObj.incomeSubtitle = retObj[key]
        ? `${growthPct(retObj[key])} 1-year ${growthWord(retObj[key])}`
        : "";
  
      return retObj;
    }
    else{
      return{
        incomeCurr: false,
      }
    }

  }
};

export default generator;
