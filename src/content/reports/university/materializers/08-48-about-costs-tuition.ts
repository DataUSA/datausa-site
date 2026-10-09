// Converted from legacy canon_cms_materializer #48 "[About - Costs] Tuition" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 48,
  name: "[About - Costs] Tuition",
  ordering: 8,
  allowed: "always",
  logic: (variables) => {
    const {inStateTuition, inStateTuitionNation, outOfStateTuition, outOfStateTuitionNation, districtTuition, districtTuitionNation} = variables;

    return {
      inStateTuitionDiff: inStateTuition - inStateTuitionNation,
      outOfStateTuitionDiff: outOfStateTuition - outOfStateTuitionNation,
      districtTuitionDiff: districtTuition - districtTuitionNation,
      inStateTuitionDiffAbs: Math.abs(inStateTuition - inStateTuitionNation),
      outOfStateTuitionDiffAbs: Math.abs(outOfStateTuition - outOfStateTuitionNation),
      districtTuitionDiffAbs: Math.abs(districtTuition - districtTuitionNation)
    }
  }
};

export default materializer;
