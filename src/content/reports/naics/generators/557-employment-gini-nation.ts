// Converted from legacy canon_cms_generator #557 "[Employment] GINI (Nation)" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 557,
  name: "[Employment] GINI (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&include=Workforce+Status:true;Nation:01000US&locale=en&measures=Record+Count%2CTotal+Population%2CAverage+Wage&filters=Record+Count.gte.5&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const config: Record<string, any> = {
      data: resp.data,
      bucket: "Wage Bin", 
      value: "Average Wage", 
      weight: "Total Population"
    };

    const giniNation = formatters.gini(config);

    return {giniNation};
  }
};

export default generator;
