// Converted from legacy canon_cms_materializer #86 "Visibility Bacherlors" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 86,
  name: "Visibility Bacherlors",
  ordering: 10,
  allowed: "always",
  logic: (variables) => {
    const {bachelorsMostPopularDegree, bachelorsNotMostPopularDegree, isHiddenUniversity} = variables;

    let bachelorPopular
    let bachelorNotPopular

    if (isHiddenUniversity === true) {
      bachelorPopular = false;
      bachelorNotPopular = false
    }

    else {
      bachelorPopular = bachelorsMostPopularDegree;
      bachelorNotPopular = bachelorsNotMostPopularDegree
    }

    return {
      bachelorPopular,
      bachelorNotPopular
    }
  }
};

export default materializer;
