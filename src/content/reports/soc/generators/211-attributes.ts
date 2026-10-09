// Converted from legacy canon_cms_generator #211 "Attributes" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 211,
  name: "Attributes",
  allowed: "always",
  api: attrs => `/api/search?id=${attrs.id}&dimension=PUMS%20Occupation`,
  logic: (resp) => {
    const data = resp.results[0];

    return {
      isMajorOccupationGroup: data.hierarchy === "Major Occupation Group",
      isMinorOccupationGroup: data.hierarchy === "Minor Occupation Group",
      isBroadOccupation: data.hierarchy === "Broad Occupation",
      isDetailedOccupation: data.hierarchy === "Detailed Occupation",
      isHiddenMajorOccupationGroup: data.hierarchy !== "Major Occupation Group",
      isHiddenMinorOccupationGroup: data.hierarchy !== "Minor Occupation Group",
      isHiddenBroadOccupation: data.hierarchy !== "Broad Occupation",
      isHiddenDetailedOccupation: data.hierarchy !== "Detailed Occupation",
    }
  }
};

export default generator;
