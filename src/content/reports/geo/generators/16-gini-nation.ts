// Converted from legacy canon_cms_generator #16 "GINI (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 16,
  name: "GINI (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=Nation:01000US&measures=Average+Wage,Total+Population,Record+Count&time=Year.latest&drilldowns=Wage+Bin&Workforce+Status=true&filters=Record+Count.gte.5`,
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
