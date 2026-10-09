// Converted from legacy canon_cms_generator #669 "[Employment] Avg Salary & hours by Time Status" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 669,
  name: "[Employment] Avg Salary & hours by Time Status",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CEmployment+Time+Status%2CIndustry+Sector&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CAverage+Wage%2CAverage+Usual+Hours+Worked+Per+Week&time=Year.latest&filters=Record+Count.gte.5`,
  logic: (resp) => {
    const currData = resp.data;

    const fullTime = currData.filter((d: any) => d["Employment Time Status ID"] === 1)[0]
    const partTime = currData.filter((d: any) => d["Employment Time Status ID"] === 2)[0]

    return {
      avgSalaryPartTime: partTime["Average Wage"],
      avgSalaryFullTime: fullTime["Average Wage"],
      avgHoursPartTime: partTime["Average Usual Hours Worked Per Week"],
      avgHoursFullTime: fullTime["Average Usual Hours Worked Per Week"]
    }
  }
};

export default generator;
