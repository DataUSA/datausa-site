// Converted from legacy canon_cms_materializer #65 "Visibility Variables" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 65,
  name: "Visibility Variables",
  ordering: 9,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy, id} = variables;

    return {
      hidden: false,
      isSector: hierarchy === "Industry Sector",
      isSubSector: hierarchy === "Industry Sub-Sector",
      isGroup: hierarchy === "Industry Group",
      isSectorOrSubSector: hierarchy !== "Industry Group",
  
      workforce_workforce: true,
      workforce_wage: false,
      wage_workforce: false,
      wage_wage: true,
  
      sizeSelected: false,
      stateSelected: false,
  
      pyramidWork_workforce: true,
      pyramidWork_wage: false,
      pyramidWage_workforce: false,
      pyramidWage_wage: true,
  
      educationWork_workforce: true,
      educationWork_wage: false,
      educationWage_workforce: false,
      educationWage_wage: true,
  
      isSectorMedianEarnings: id === "928110" ? false : hierarchy === "Industry Sector" ? true : false,
    }
  }
};

export default materializer;
