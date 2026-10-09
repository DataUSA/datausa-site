// Converted from legacy canon_cms_generator #577 "Workforce" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 577,
  name: "Workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population%2CAverage+Wage%2CAverage+Age%2CAverage+Wage+Appx+MOE&filters=Record+Count.gte.5&time=Year.latest`,
  logic: (resp) => {

    const data = resp.data;

    return {
      totalWorkforce: data[0]["Total Population"],
      avgAgeWorkforce: data[0]["Average Age"],
      avgSalary: data[0]["Average Wage"],
      avgSalaryMoe: data[0]["Average Wage Appx MOE"],
      pumsYear: data[0].Year
    }
  }
};

export default generator;
