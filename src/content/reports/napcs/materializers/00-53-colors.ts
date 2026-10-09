// Converted from legacy canon_cms_materializer #53 "Colors" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 53,
  name: "Colors",
  ordering: 0,
  allowed: "always",
  logic: (variables) => {
    /*return {
      colorGrey: "#C6C7CA",
      colorHighlight: "#ef6145"
    }*/
    return{
      colors: false
    }
  }
};

export default materializer;
