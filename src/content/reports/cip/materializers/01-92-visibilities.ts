// Converted from legacy canon_cms_materializer #92 "Visibilities" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 92,
  name: "Visibilities",
  ordering: 1,
  allowed: "always",
  logic: (variables) => {
    const {institutionsSubSectionVis, tuitionCostsVis, specializedCollegesVis, degreesAwardedByCountyVis, growthAwardedDegreesVis} = variables;

    // Institutions

    let institutionsVis = true

    if(!institutionsSubSectionVis && !tuitionCostsVis && !specializedCollegesVis && !degreesAwardedByCountyVis && !growthAwardedDegreesVis) {
      institutionsVis = false
    }

    return {
      institutionsVis
    }
  }
};

export default materializer;
