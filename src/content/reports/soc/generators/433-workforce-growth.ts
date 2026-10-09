// Converted from legacy canon_cms_generator #433 "Workforce Growth" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 433,
  name: "Workforce Growth",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=bls_growth_occupation&include=Occupation:${attrs.id}&drilldowns=Year,Occupation&measures=Occupation+Employment`,
  logic: (resp, {libs, formatters}) => {
    if (!resp.data.length) return {hasBLS: false, noBLS: true};

    const {max, sum} = libs.d3;
    const {growth, list} = formatters;
    const currentYear = new Date().getFullYear();
    const projectedYear = max(resp.data, (d: any) => d["Year"]);
    const latestYear = max(resp.data, (d: any) => d["Year"] < currentYear ? d["Year"] : 0);

    const futureData = resp.data.filter((d: any) => d["Year"] === projectedYear);
    const latestData = resp.data.filter((d: any) => d["Year"] === latestYear);

    const jobs: string = "Occupation Employment";

    const currJobs = sum(latestData.map((d: any) => d[jobs]));
    const projJobs = sum(futureData.map((d: any) => d[jobs]));

    return {
      blsID: latestData.map((d: any) => d["Occupation ID"]).join(","),
      blsName: list(latestData.map((d: any) => d["Occupation"])),
      employeesBLS: currJobs,
      jobsGrowth: growth({curr: projJobs, prev: currJobs}),
      hasBLS: true,
      noBLS: false,
      employeesBLSYear: latestYear
    };

  }
};

export default generator;
