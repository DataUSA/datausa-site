// Converted from legacy canon_cms_generator #610 "[Education] Education Levels Wage" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 610,
  name: "[Education] Education Levels Wage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Group,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status%3Atrue&locale=en&measures=Record+Count,Average+Wage&filters=Record+Count.gte.5&top=1.Year.Average+Wage.desc&time=Year.latest`,
  logic: (resp) => {
    const data = resp.data;

    return {
      top1EdLevelWageName: data.length > 0 && data[0]["Group"],
      top1EdLevelWage: data.length > 0 && data[0]["Average Wage"],
      topEdLevelWageYear: data[0].Year,
    }
  }
};

export default generator;
