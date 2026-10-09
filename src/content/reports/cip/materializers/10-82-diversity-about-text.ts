// Converted from legacy canon_cms_materializer #82 "[Diversity] About Text" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 82,
  name: "[Diversity] About Text",
  ordering: 10,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {gradsRace1Name, gradsRace1Value, parentName, gradsGenderTop} = variables;
    const {commas} = formatters;

    let diversityText: any = ""

    if (gradsRace1Name && gradsGenderTop) {
      diversityText = `${gradsGenderTop} employees are more likely to hold ${parentName} degrees, and ${gradsRace1Name} students are the most common race/ethnicty group awarded degrees in ${parentName} (${commas(gradsRace1Value)} students).`
    }

    else if (gradsRace1Name) {
      diversityText = `${gradsRace1Name} students are the most common race/ethnicty group awarded degrees in ${parentName} (${commas(gradsRace1Value)} students).`
    }

    else if (gradsGenderTop){
      diversityText = `${gradsGenderTop} employees are more likely to hold ${parentName} degrees.`
    }

    else {
      diversityText = ""
    }


    return {
      diversityText
    }
  }
};

export default materializer;
