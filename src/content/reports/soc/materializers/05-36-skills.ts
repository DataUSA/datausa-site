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

    let showSkills
    if (showRCASkills === false && showValueSkills === false){
       showSkills = false;
    }

    else {
       showSkills = true;
    }

    return {
      onetValue: "Value",
      onetRCA: "RCA",
      onetGroup: "Skill Group",
      showSkills
    }
  }
};

export default materializer;
