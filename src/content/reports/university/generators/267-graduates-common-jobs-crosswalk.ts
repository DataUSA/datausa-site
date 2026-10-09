// Converted from legacy canon_cms_generator #267 "[Graduates] Common Jobs Crosswalk" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 267,
  name: "[Graduates] Common Jobs Crosswalk",
  allowed: "always",
  api: attrs => `/api/university/commonJobLookup/${attrs.id}/${attrs.hierarchy}`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;
    const url = (d: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`;

    return {
      commonJobsIds: resp.data.slice(0, 5).map((d: any) => d["Detailed Occupation ID"]).join(),
      commonJobsTop5: resp.data.slice(0, 5).map((d: any) => `${url(d)} (${commas(d["Total Population"])} people)`),
      commonJobsTop1Name: url(resp.data[0])
    }
  }
};

export default generator;
