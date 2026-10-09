// Converted from legacy canon_cms_generator #680 "Wage (Nation)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 680,
  name: "Wage (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Nation&include=Workforce+Status%3Atrue%3BNation%3A01000US&locale=en&measures=Average+Wage&time=Year.latest&filters=Record+Count.gte.5`,
  logic: (resp) => {
    // /api/data?Geography=01000US&measure=Average%20Wage,Total%20Population,Record%20Count&Year=latest&Workforce%20Status=true&order=ID%20Wage%20Bin&sort=asc&Record%20Count>=5&limit=1

    const data = resp.data[0];

    return {
      avgSalaryNation: data["Average Wage"]
    }
  }
};

export default generator;
