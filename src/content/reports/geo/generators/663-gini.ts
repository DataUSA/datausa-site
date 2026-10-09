// Converted from legacy canon_cms_generator #663 "GINI" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 663,
  name: "GINI",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=${attrs.pumsHierarchy},Wage+Bin,Year&include=Workforce+Status:true;${attrs.pumsHierarchy}:${attrs.pumsID}&locale=en&measures=Record+Count,Total+Population,Average+Wage&filters=Record+Count.gte.5`,
  logic: (resp, {libs, formatters, variables}) => {

    const {nest} = libs.d3;
    const {list} = formatters;
    const {pumsHierarchy, hierarchy} = variables;

    const data = resp.data;

    if(data.length > 0){
  
      const lastYear = libs.d3.max(data, (d: any) => d.Year)
      const prevYear = lastYear - 1
  
      const currData = data.filter((d: any) => d.Year === lastYear)
      const prevData = data.filter((d: any) => d.Year === prevYear)
  
      const config: Record<string, any> = {
        bucket: "Wage Bin", 
        value: "Average Wage", 
        weight: "Total Population"
      };
  
      const giniCurr = formatters.gini(Object.assign({data: currData}, config));
      const giniPrev = formatters.gini(Object.assign({data: prevData}, config));
      const giniGrowth = formatters.growth({curr: giniCurr, prev: giniPrev});
  
      const gini1Geo = data[0][pumsHierarchy];
      const gini1Curr = giniCurr;
      const gini1Prev = giniPrev;
      const gini1Growth = giniGrowth;
      const gini1Direction = giniGrowth * -1;
    
      const subs = hierarchy === "Nation" || hierarchy === "State" || hierarchy === "PUMA"
    
      return{
        giniSubName: !subs ? currData[0][pumsHierarchy] : false,
        giniSubId: !subs ? currData[0][`${pumsHierarchy} ID`] : false,
        giniCurrYear: lastYear, 
        giniPrevYear: prevYear,
        giniCurr,
        giniPrev,
        giniGrowth,
        gini1Geo,
        gini1Curr,
        gini1Prev,
        gini1Growth,
        gini1Direction
      }
    }
    else{
      return{
        gini1Curr: false
      }
    }

  }
};

export default generator;
