// Converted from legacy canon_cms_materializer #36 "Skills" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 36,
  name: "Skills",
  ordering: 5,
  allowed: "always",
  logic: (variables) => {
    const {showRCASkills, showValueSkills} = variables;

    // a flag left undefined (its generator failed, e.g. api-penn answering an empty result with a 500)
    // counts as "no skills", so a failed generator hides the topic instead of showing it empty (QA DIFF-006)
    const showSkills = Boolean(showRCASkills || showValueSkills);

    return {
      onetValue: "Value",
      onetRCA: "RCA",
      onetGroup: "Skill Group",
      showSkills
    }
  }
};

export default materializer;
