// Converted from legacy canon_cms_generator #268 "[Graduates] Common Industry Crosswalk" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 268,
  name: "[Graduates] Common Industry Crosswalk",
  allowed: "always",
  api: attrs => `/api/university/commonIndustryLookup/${attrs.id}/${attrs.hierarchy}`,
  logic: (resp, {formatters}) => {
    /*

    /api/data?measures=Total%20Population,Record%20Count&year=latest&drilldowns=CIP2,Industry%20Group&order=Total%20Population&Workforce%20Status=true&Employment%20Time%20Status=1&sort=desc&Record%20Count>=5

    const commonJobsTop5 = dedupedJobs.slice(0, 5).map((d: any) => `${d["Detailed Occupation"]} (${commas(d["Total Population"])} people)`)
    const commonJobsTop1Name = dedupedJobs[0]["Detailed Occupation"];
    const commonJobsHighestWageTop5Names = dedupedWages.sort((a: any, b: any) => b["Average Wage"] - a["Average Wage"]).map((d: any) => d["Detailed Occupation"]);
    const commonJobsHighestWageTop1Name = commonJobsHighestWageTop5Names[0];

    const commonIndustriesTop5 = dedupedIndustries.slice(0, 5).map((d: any) => `${d["Industry Group"]} (${commas(d["Total Population"])} people)`)
    const commonIndustriesTop1Name = dedupedIndustries[0]["Industry Group"]; 

    */

    const {commas} = formatters;

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;
    return {
      commonIndustriesIds: resp.data.slice(0, 5).map((d: any) => d["Industry Group ID"]).join(),
      commonIndustriesTop5: resp.data.slice(0, 5).map((d: any) => `${url(d)} (${commas(d["Total Population"])} people)`),
      commonIndustriesTop1Name: url(resp.data[0])
    }
  }
};

export default generator;
