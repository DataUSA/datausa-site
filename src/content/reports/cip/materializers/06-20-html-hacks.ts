// Converted from legacy canon_cms_materializer #20 "HTML Hacks" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 20,
  name: "HTML Hacks",
  ordering: 6,
  allowed: "always",
  logic: (variables) => {
    return {
      br: "<br />",
      inStateMeasure: "State Tuition",
      graduatesMeasure: "Total Graduates",
      outStateMeasure: "Out Of State Tuition",
      popMeasure: "People in Workforce",
      popRCAMeasure: "People in Workforce (RCA)",
      onetValue: "Value",
      onetRCA: "RCA",
      onetGroup: "Skill Group"
    }
  }
};

export default materializer;
