// Converted from legacy canon_cms_generator #542 "[Employment] Wages and Workforce" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 542,
  name: "[Employment] Wages and Workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,CIP2&include=Workforce+Status:true;CIP2:${attrs.cip2}&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Age,Average+Wage+Appx+MOE,Average+Age+Appx+MOE&filter=Record+Count.gte.5&time=Year.latest.2`,
  logic: (resp, {formatters}) => {
    const data = resp.data.sort((a: any, b: any) => b["Year"] - a["Year"])

    const currWage: any = data.length > 0 ? data[0]["Average Wage"] : false;
    const prevWage: any = data.length > 1 ? data[1]["Average Wage"] : false;
    const currForce: any = data.length > 0 ? data[0]["Total Population"] : false;
    const prevForce: any = data.length > 1 ? data[1]["Total Population"] : false;
    const currAge: any = data.length > 0 ? data[0]["Average Age"] : false;
    const prevAge: any = data.length > 1 ? data[1]["Average Age"] : false;
    const currWageMOE: any = data.length > 0 ? data[0]["Average Wage Appx MOE"] : false;
    const prevWageMOE: any = data.length > 1 ? data[1]["Average Wage Appx MOE"] : false;
    const currAgeMOE: any = data.length > 0 ? data[0]["Average Age Appx MOE"] : false;
    const prevAgeMOE: any = data.length > 1 ? data[1]["Average Age Appx MOE"] : false;
    const currForceMOE: any = data.length > 0 ? data[0]["Total Population MOE Appx"] : false;
    const prevForceMOE: any = data.length > 1 ? data[1]["Total Population MOE Appx"] : false;
    const currForceYear: any = data.length > 0 ? data[0]["Year"] : false;
    const prevForceYear: any = data.length > 1 ? data[1]["Year"] : false;


    return {
      currWage,
      currForce,
      prevForce,
      currForceYear,
      prevForceYear,
      currForceMOE,
      currAge,
      currWageMOE,
      currAgeMOE,
      wageMOEGrowth: formatters.growth({curr: currWage, prev: prevWage, currMoe: currWageMOE, prevMoe: prevWageMOE}),
      wageGrowth: formatters.growth({curr: currWage, prev: prevWage}),
      forceGrowth: formatters.growth({curr: currForce, prev: prevForce}),
      forceMOEGrowth: formatters.growth({curr: currForce, prev: prevForce, currMoe: currForceMOE, prevMoe: prevForceMOE}),
      ageGrowth: formatters.growth({curr: currAge, prev: prevAge}),
      ageMOEGrowth: formatters.growth({curr: currAge, prev: prevAge, currMoe: currAgeMOE, prevMoe: prevAgeMOE})
    }
  }
};

export default generator;
