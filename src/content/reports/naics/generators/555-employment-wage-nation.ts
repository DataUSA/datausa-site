// Converted from legacy canon_cms_generator #555 "[Employment] Wage (Nation)" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 555,
  name: "[Employment] Wage (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year&include=Nation:01000US;Workforce+Status:true&locale=en&measures=Average+Wage&time=Year.latest`,
  logic: (resp) => {
    // /api/data?&measure=Average%20Wage,Total%20Population,Record%20Count&Year=latest&order=ID%20Wage%20Bin&sort=asc&Record%20Count>=5&limit=1

    const data = resp.data[0];

    return {
      avgSalaryNation: data["Average Wage"],
      lastYearNationalSalary: data["Year"]
    }
  }
};

export default generator;
