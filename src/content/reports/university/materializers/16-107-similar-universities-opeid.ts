// Converted from legacy canon_cms_materializer #107 "Similar Universities / OPEID" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 107,
  name: "Similar Universities / OPEID",
  ordering: 16,
  allowed: "always",
  logic: (variables) => {
    const {similarOpeidId, similarID} = variables;

    const similarOpeidId_List = similarOpeidId.split(",").map(String);
    const similarID_List = similarID.split(",").map(String);

    return {
      similarOpeidId_List,
      similarID_List
    }
  }
};

export default materializer;
