// Converted from legacy canon_cms_generator #643 "Poverty" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 643,
  name: "Poverty",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygpsar_poverty_by_gender_age_race_5&drilldowns=Year,Poverty+Status&measures=Poverty+Population&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const data = resp.data;

    if(data.length > 0){
  
      const measure: string = "Poverty Population";
      const currYear = max(data, (d: any) => d.Year);
      const prevYear = currYear - 1;
  
      const lastData = data.filter((d: any) => d.Year === currYear);
      const prevData = data.filter((d: any) => d.Year === prevYear);
  
      const belowCurr = lastData.length > 0 ? lastData.filter((d: any) => d["Poverty Status ID"]*1 === 0) : [];
      const aboveCurr = lastData.length > 0 ? lastData.filter((d: any) => d["Poverty Status ID"]*1 === 1) : [];
  
      const belowPrev = prevData.length > 0 ? prevData.filter((d: any) => d["Poverty Status ID"]*1 === 0) : [];
      const abovePrev = prevData.length > 0 ? prevData.filter((d: any) => d["Poverty Status ID"]*1 === 1) : [];
  
      const currPoverty = belowCurr.length > 0 ? belowCurr[0][measure] : 0
      const currTotal = aboveCurr.length > 0 ? currPoverty + aboveCurr[0][measure] : 0;
  
      const prevPoverty = belowPrev.length > 0 ? belowPrev[0][measure] : 0
      const prevTotal: any = abovePrev.length > 0 ? prevPoverty + abovePrev[0][measure] : false;
  
      const retObj: Record<string, any> = {
        currPoverty,
        currPovertyYear: currYear,
        currPovertyTotal: currTotal,
        povertyRate: (currPoverty / currTotal) * 100,
        povertyRatePrev: prevTotal ? (prevPoverty / prevTotal) * 100 : false,
        povertyRateGrowth: false
      };
  
      if (prevData.length > 0) retObj.povertyRateGrowth = formatters.growth({prev: retObj.povertyRatePrev, curr: retObj.povertyRate});
  
      if (belowPrev.length > 0) {
        retObj.prevPoverty = belowPrev[0][measure];
      }
  
      return retObj;
    }
    else{
      return{
        povertyRate: false,
      }
    }
  }
};

export default generator;
