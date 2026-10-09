// Converted from legacy canon_cms_materializer #15 "Race/Ethnicity Text" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 15,
  name: "Race/Ethnicity Text",
  ordering: 13,
  allowed: "always",
  logic: (variables, {formatters}) => {
    let raceTopSentence: any;
    const {nameLower, raceCutoff, raceData, raceNumRaw} = variables;
    const {abbreviate, list} = formatters;

    if(raceNumRaw > 0){
      let raceTopSentence: any = `The ${raceNumRaw > raceCutoff ? `${raceCutoff} largest ethnic groups in ${nameLower} are` : `population of ${nameLower} is`}  `;
      raceTopSentence += raceNumRaw > raceCutoff
        ? list(raceData.slice(0, raceCutoff).map((d: any) => `${d.name} (${abbreviate(d.share * 100)}%)`))
        : list(raceData.map((d: any) => `${abbreviate(d.share * 100)}% ${d.name}`));
      raceTopSentence += ".";
    }

    return {
      raceTopSentence: raceNumRaw > 0 ? raceTopSentence : false,
      raceStatTitle: raceNumRaw > 3 ? `The 3 largest ethnic groups in ${nameLower}` : "Most common ethnic groups"
    };
  }
};

export default materializer;
