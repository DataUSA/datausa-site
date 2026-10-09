// Converted from legacy canon_cms_generator #711 "[Employment] Total Avg Wage" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 711,
  name: "[Employment] Total Avg Wage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year&locale=en&measures=Average+Wage&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true`,
  logic: (resp, {libs}) => {
    const {max, min} = libs.d3;

    const currYear = max(resp.data, (d: any) => d["Year"]);
    const firstYear = min(resp.data, (d: any) => d["Year"]);

    const currData = resp.data.filter((d: any) => d["Year"] === currYear);
    const firstData = resp.data.filter((d: any) => d["Year"] === firstYear);

    const totalAvgWage = currData.filter((d: any) => d["Year"] === currYear);
    const totalAvgWageFirst = firstData.filter((d: any) => d["Year"] === firstYear);

    return {
      totalAvgWage: totalAvgWage[0]["Average Wage"],
      growthAvgWage: ((totalAvgWage[0]["Average Wage"] - totalAvgWageFirst[0]["Average Wage"]) / totalAvgWageFirst[0]["Average Wage"]) * 100,
      avgWageFirstYear: totalAvgWageFirst[0]["Average Wage"],
    }
  }
};

export default generator;
