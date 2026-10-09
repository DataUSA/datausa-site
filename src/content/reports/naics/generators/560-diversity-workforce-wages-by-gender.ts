// Converted from legacy canon_cms_generator #560 "[Diversity] Workforce & wages by gender" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 560,
  name: "[Diversity] Workforce & wages by gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population%2CAverage+Wage%2CAverage+Wage+Appx+MOE&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    const {commas} = formatters;
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    if (data.length !== 0) {
  
  
      const lastYearWorkforcePop = data[0]["Year"]
      const lastData = data;
  
      const workforcePopulation = libs.d3.sum(lastData, (d: any) => d["Total Population"]);
  
      const menWorkforce = lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]
      const womenWorkforce = lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]
  
      const menWorkforcePct = (lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"]/workforcePopulation) * 100
      const womenWorkforcePct = (lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"]/workforcePopulation) * 100
  
      const menWage = lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Average Wage"]
      const womenWage = lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Average Wage"]
  
  
      const avgSalaryMaleMOE = lastData.filter((d: any) => d["Gender ID"] === 1)[0]["Average Wage Appx MOE"]
      const avgSalaryFemaleMOE = lastData.filter((d: any) => d["Gender ID"] === 2)[0]["Average Wage Appx MOE"]
  
  
      return {
        lastYearWorkforcePop,
        workforcePopulation,
        menWorkforce,
        womenWorkforce,
        menWorkforcePct,
        womenWorkforcePct,
        menWage,
        womenWage,
        avgSalaryMaleMOE,
        avgSalaryFemaleMOE
      }
    }

    else {
      return{
       workforcePopulation: false
      }
    }
  }
};

export default generator;
