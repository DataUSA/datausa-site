// Converted from legacy canon_cms_generator #504 "[Operations] Salary Expenditure" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 504,
  name: "[Operations] Salary Expenditure",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Total+Salaries,Median+Total+Expenses&sort=Year.desc`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data.filter((d: any) => d["Median Total Salaries"] !== null && d["Median Total Expenses"] !== null);

    if(data.length > 0){
  
      const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
  
      //let data = resp.data.filter((d: any) => d["Year"] === latestYear);
  
      const dataSalaries = data.filter((d: any) => d["Year"] <= latestYear);
      const dataSalariesPrev = data.filter((d: any) => d["Year"] <= latestYear - 1);
  
      const financeSalariesYearCurr = latestYear
      const financeSalariesYearPrev = latestYear - 1
  
      const financeSalaries: any = dataSalaries[0] ? dataSalaries[0]["Median Total Salaries"] : false;
      const financeSalariesPrev: any = dataSalariesPrev[0] ? dataSalariesPrev[0]["Median Total Salaries"] : false;
  
      const financeSalariesGrowth: any = financeSalariesPrev ? formatters.growth({curr: financeSalaries, prev: financeSalariesPrev}) : false;
      const financeSalariesDiff = financeSalaries - financeSalariesPrev;
  
      const financeSalaries2YearsBeforeValue: any = dataSalaries[2] ? dataSalaries[2]["Median Total Salaries"] : false;
      const financeSalaries2YearsBeforeYear: any = dataSalaries[2] ? dataSalaries[2]["Year"] : false;
      const financeSalaries3YearsBeforeValue: any = dataSalaries[3] ? dataSalaries[3]["Median Total Salaries"] : false;
      const financeSalaries3YearsBeforeYear: any = dataSalaries[3] ? dataSalaries[3]["Year"] : false;
  
      const financeSalariesGrowth2YearsBefore: any = financeSalaries2YearsBeforeValue ? formatters.growth({curr: financeSalariesPrev, prev: financeSalaries2YearsBeforeValue}) : false;
      const financeSalariesGrowth2YearsBeforeDiff = financeSalariesPrev - financeSalaries2YearsBeforeValue;
      const financeSalariesGrowth3YearsBefore: any = financeSalaries3YearsBeforeValue ? formatters.growth({curr: financeSalaries2YearsBeforeValue, prev: financeSalaries3YearsBeforeValue}) : false;
      const financeSalariesGrowth3YearsBeforeDiff = financeSalaries2YearsBeforeValue - financeSalaries3YearsBeforeValue;
  
      let string_: any = "";
  
      if (financeSalariesGrowth3YearsBefore && financeSalariesGrowth2YearsBefore) {
        string_ = `This is compared to a ${formatters.growthPct(financeSalariesGrowth2YearsBefore)} ${formatters.growthWord(financeSalariesGrowth2YearsBeforeDiff)} between ${financeSalaries2YearsBeforeYear} and ${financeSalariesYearPrev}, and a ${formatters.growthPct(financeSalariesGrowth3YearsBefore)} ${formatters.growthWord(financeSalariesGrowth3YearsBeforeDiff)} between ${financeSalaries3YearsBeforeYear} and ${financeSalaries2YearsBeforeYear}.`
      }
  
      else if (financeSalariesGrowth2YearsBefore) {
        string_ = `This is compared to a ${formatters.growthPct(financeSalariesGrowth2YearsBefore)} ${formatters.growthWord(financeSalariesGrowth2YearsBeforeDiff)} between ${financeSalaries2YearsBeforeYear} and ${financeSalariesYearPrev}.`
      }
  
      else {
        string_ = ""
      }
  
      return {
        financeSalariesYearCurr,
        financeSalariesYearPrev,
        financeSalaries,
        financeSalariesPrev,
        financeSalariesGrowth,
        financeSalariesDiff,
    
        financeSalariesGrowth2YearsBefore,
        financeSalariesGrowth3YearsBefore,
        financeSalariesGrowth2YearsBeforeDiff,
        financeSalariesGrowth3YearsBeforeDiff,
        financeSalaries2YearsBeforeYear,
        financeSalaries3YearsBeforeYear,
    
        salaryExpenditureVis: true,
        salaryExpenditureText: string_,
        salaryExpenditureYearPrevVis: resp.data[1] ? true : false,
        salaryExpenditureYearCurrVis: resp.data[1] ? false : true
      }
    }
    else{
      return{
          salaryExpenditureVis: false
      }
    }
  }
};

export default generator;
