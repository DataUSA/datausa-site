// Converted from legacy canon_cms_materializer #95 "[Specialized Colleges] Degree Share by University" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 95,
  name: "[Specialized Colleges] Degree Share by University",
  ordering: 8,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {completionShares} = variables;
    const {abbreviate} = formatters;

    const url = (d: any) => `<a href='/profile/university/${d["University ID"]}'>${d["University"]}</a>`;


    completionShares.sort((a: any, b: any) => {
      if (a["Completions Share Of University"] !== b["Completions Share Of University"]) {
        return b["Completions Share Of University"] - a["Completions Share Of University"]; // Sort by businessCompletionPercentage (descending)
      } else {
        return b["Completions"] - a["Completions"];
      }
    });


    return {
      degree1Share: completionShares.length > 0 ? url(completionShares[0]) : false,
      degree2Share: completionShares.length > 1 ? url(completionShares[1]) : false,
      degree3Share: completionShares.length > 2 ? url(completionShares[2]) : false,
      degree1SharePct: completionShares.length > 0 ? `${abbreviate(completionShares[0]["Completions Share Of University"] * 100)}%` : false,
      degree2SharePct: completionShares.length > 1 ? `${abbreviate(completionShares[1]["Completions Share Of University"] * 100)}%` : false,
      degree3SharePct: completionShares.length > 2 ? `${abbreviate(completionShares[2]["Completions Share Of University"] * 100)}%` : false,
      specializedCollegesVis: completionShares[0] ? true : false
    }
  }
};

export default materializer;
