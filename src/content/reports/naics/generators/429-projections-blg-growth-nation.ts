// Converted from legacy canon_cms_generator #429 "[Projections] BLG Growth (Nation)" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 429,
  name: "[Projections] BLG Growth (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&drilldowns=Year,Industry&measures=Industry+Jobs%2CIndustry+Output&filters=Industry Output.gt.0`,
  logic: (resp, {libs, formatters, variables}) => {
    const {max} = libs.d3;
    const {growth} = formatters;
    const {blsIds} = variables

    const blsIDs = Object.values(blsIds);

    const data = resp.data.filter((d: any) => blsIDs.includes(d["Industry ID"]))

    if(data.length > 0){

      const currentYear = new Date().getFullYear();
      const projectedYear = max(data, (d: any) => d["Year"]);
      const latestYear = max(data, (d: any) => d["Year"] < currentYear ? d["Year"] : 0);
  
      const futureData = data.find((d: any) => d["Year"] === projectedYear);
      const latestData = data.find((d: any) => d["Year"] === latestYear);
  
      const jobs: string = "Industry Jobs";
      const output: string = "Industry Output";
  
      return {
        jobsGrowthNation: growth({curr: futureData[jobs], prev: latestData[jobs]}),
        outputGrowthNation: growth({curr: futureData[output], prev: latestData[output]})
      }
    }
    else{
      return{
        jobsGrowthNation: false,
        outputGrowthNation: false
      }
    }
  }
};

export default generator;
