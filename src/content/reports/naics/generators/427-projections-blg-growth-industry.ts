// Converted from legacy canon_cms_generator #427 "[Projections] BLG Growth (Industry) " (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 427,
  name: "[Projections] BLG Growth (Industry) ",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=bls_growth_industry&measures=Industry Jobs,Industry Output&drilldowns=Year,Industry&filters=Industry Output.gt.0`,
  logic: (resp, {libs, formatters, variables}) => {
    const {max} = libs.d3;
    const {growth} = formatters;
    const {blsIds} = variables

    const blsIDs = Object.values(blsIds);

    const data = resp.data.filter((d: any) => blsIDs.includes(d["Industry ID"]))

    const currentYear = new Date().getFullYear();
    const projectedYear = max(data, (d: any) => d["Year"]);
    const latestYear = max(data, (d: any) => d["Year"] < currentYear ? d["Year"] : 0);

    const futureData = data.filter((d: any) => d["Year"] === projectedYear);
    const latestData = data.filter((d: any) => d["Year"] === latestYear);

    const totalFutureDataJobs = futureData.reduce((sum: any, d: any) => {return sum + d["Industry Jobs"];},0)
    const totalLatestDataJobs = latestData.reduce((sum: any, d: any) => {return sum + d["Industry Jobs"];},0)

    const totalFutureDataOutput = futureData.reduce((sum: any, d: any) => {return sum + d["Industry Output"];},0)
    const totalLatestDataOutput = latestData.reduce((sum: any, d: any) => {return sum + d["Industry Output"];},0)


    return {
      jobsGrowthIndustry: growth({curr: totalFutureDataJobs, prev: totalLatestDataJobs}),
      outputGrowthIndustry: growth({curr: totalFutureDataOutput, prev: totalLatestDataOutput}),
    };
  }
};

export default generator;
