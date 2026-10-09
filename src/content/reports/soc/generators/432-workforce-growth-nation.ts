// Converted from legacy canon_cms_generator #432 "Workforce Growth (Nation)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 432,
  name: "Workforce Growth (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=bls_growth_occupation&drilldowns=Year&measures=Occupation+Employment`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const {growth} = formatters;
    const currentYear = new Date().getFullYear();
    const projectedYear = max(resp.data, (d: any) => d["Year"]);
    const latestYear = max(resp.data, (d: any) => d["Year"] < currentYear ? d["Year"] : 0);

    const futureData = resp.data.find((d: any) => d["Year"] === projectedYear);
    const latestData = resp.data.find((d: any) => d["Year"] === latestYear);

    const jobs: string = "Occupation Employment";

    return {
      jobsGrowthNation: growth({curr: futureData[jobs], prev: latestData[jobs]})
    };
  }
};

export default generator;
