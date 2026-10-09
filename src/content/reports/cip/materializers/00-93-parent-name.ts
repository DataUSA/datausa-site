// Converted from legacy canon_cms_materializer #93 "Parent Name" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 93,
  name: "Parent Name",
  ordering: 0,
  allowed: "always",
  logic: (variables) => {
    const {parentNameIPEDS, parentNamePUMS} = variables;

    let parentName: any = ""

    if (parentNameIPEDS) {
      parentName = parentNameIPEDS
    }

    else {
      parentName = parentNamePUMS
    }

    return {
      parentName
    }
  }
};

export default materializer;
