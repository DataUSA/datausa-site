// Converted from legacy canon_cms_generator #553 "[Employment] Avg Salary & Age" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 553,
  name: "[Employment] Avg Salary & Age",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CAverage+Wage%2CAverage+Age%2CAverage+Wage+Appx+MOE&time=Year.latest`,
  logic: (resp) => {
    // /api/data?PUMS%20Industry=<id>&measures=Average%20Wage,Average%20Age,Average%20Wage%20Appx%20MOE,Total%20Population,Total%20Population%20MOE%20Appx,Record%20Count&Record%20Count>=5&Workforce%20Status=true&Year=<pumsLatestYear>
    const currData = resp.data;

    return {
      avgSalary: currData[0]["Average Wage"],
      avgSalaryMOE: currData[0]["Average Wage Appx MOE"],
      avgAge: currData[0]["Average Age"],
      //totalWorkforce: currData[0]["Total Population"],
      totalWageYear: currData[0]["Year"],
     // totalWorkforceMOE: currData[0]["Total Population MOE Appx"]
    }
  }
};

export default generator;
