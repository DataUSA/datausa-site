// Converted from legacy canon_cms_generator #583 "[Wage Ranking] Avg Wage" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 583,
  name: "[Wage Ranking] Avg Wage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Record+Count,Average+Wage&filters=Record+Count.gte.5&time=Year.latest`,
  logic: (resp, {libs}) => {
    // const data = resp.data;
    // const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    // const data_ = data.filter((d: any) => d["ID Year"] === latestYear);

    return {
      avgYearlyWage: resp.data[0]["Average Wage"],
      wageRankingLastYear: resp.data[0].Year
    }

  }
};

export default generator;
