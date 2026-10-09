// Converted from legacy canon_cms_generator #642 "Insurance Coverage" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 642,
  name: "Insurance Coverage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_health_care_coverage_overall_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Kaiser+Coverage&measures=Health+Insurance+Policies`,
  logic: (resp, {libs, formatters}) => {
    const {max, sum} = libs.d3;
    const {growth} = formatters;

    if(resp.data.length > 0){
  
      const years = Array.from(new Set(resp.data.map((d: any) => d["Year"])))
        .sort().reverse();
    
      const currYear = years[0];
      const prevYear = years[1];
  
      const currData = resp.data.filter((d: any) => d["Year"] === currYear);
      const prevData = resp.data.filter((d: any) => d["Year"] === prevYear);
  
      const measure: string = "Health Insurance Policies";
      const drilldown: string = "Kaiser Coverage";
  
      const currTotal = sum(currData, (d: any) => d[measure]);
  
      const curr = currData.find((d: any) => d[drilldown] === "Uninsured")[measure] / currTotal * 100;
  
      const employer = currData.find((d: any) => d[drilldown] === "Employer")[measure];
      const medicaid = currData.find((d: any) => d[drilldown] === "Medicaid")[measure];
      const medicare = currData.find((d: any) => d[drilldown] === "Medicare")[measure];
      const other = currData.find((d: any) => d[drilldown] === "OtherPublic")[measure];
      const non = currData.find((d: any) => d[drilldown] === "NonGroup")[measure];
  
      const retObj: Record<string, any> = {
        insuranceNone: curr,
        insuranceSome: 100 - curr,
        insuranceYearCurr: currYear,
        insuranceEmp: employer / currTotal * 100,
        insuranceMedicaid: medicaid / currTotal * 100,
        insuranceMedicare: medicare / currTotal * 100,
        insuranceOther: other / currTotal * 100,
        insuranceNon: non / currTotal * 100
      }
  
      if (prevData.length) {
        const prevTotal = sum(prevData, (d: any) => d[measure]);
        const prev = prevData.find((d: any) => d[drilldown] === "Uninsured")[measure] / prevTotal * 100;
    
        retObj.insurancePrev = prev;
        retObj.insuranceYearPrev = prevYear;
        retObj.insuranceGrowth = growth({curr, prev});
      }
  
      return retObj;
    }
    else{
      return{
        insuranceYearCurr: false
      }
    }
  }
};

export default generator;
