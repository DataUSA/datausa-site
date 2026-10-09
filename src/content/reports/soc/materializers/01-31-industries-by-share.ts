// Converted from legacy canon_cms_materializer #31 "Industries by Share" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 31,
  name: "Industries by Share",
  ordering: 1,
  allowed: "always",
  logic: (variables) => {
    const {socFirstIndustryTotal, socSecondIndustryTotal, socThirdIndustryTotal, totalWorkforce} = variables;

    return {
      socFirstIndustryShare: (socFirstIndustryTotal / totalWorkforce) * 100,
      socSecondIndustryShare: (socSecondIndustryTotal / totalWorkforce) * 100,
      socThirdIndustryShare: (socThirdIndustryTotal / totalWorkforce) * 100
    }
  }
};

export default materializer;
