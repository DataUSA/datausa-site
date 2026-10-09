// Converted from legacy canon_cms_materializer #88 "Visibility Skills" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 88,
  name: "Visibility Skills",
  ordering: 13,
  allowed: "always",
  logic: (variables) => {
    const {showRCASkills, showValueSkills} = variables;

    const topSkillsVis = (showRCASkills == false && showValueSkills == false) ? false : true

    return {topSkillsVis}
  }
};

export default materializer;
