// Converted from legacy canon_cms_generator #265 "[Graduates] Common Jobs (Highest Paying) Crosswalk" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 265,
  name: "[Graduates] Common Jobs (Highest Paying) Crosswalk",
  allowed: "always",
  api: attrs => `/api/university/highestWageLookup/${attrs.id}/${attrs.hierarchy}`,
  logic: (resp) => {
    const url = (d: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`;

    return {
      commonJobsHighestWageIds: resp.data.slice(0, 5).map((d: any) => d["Detailed Occupation ID"]).join(),
      commonJobsHighestWageTop5Names: resp.data.slice(0, 5).map(url),
      commonJobsHighestWageTop1Name: url(resp.data[0])
    }
  }
};

export default generator;
