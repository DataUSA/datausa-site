// Converted from legacy canon_cms_materializer #94 "Completions Share by University" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 94,
  name: "Completions Share by University",
  ordering: 7,
  allowed: "always",
  logic: (variables) => {
    const {completionsShareByCIP, completionsShareTotals} = variables

    const completionShares = completionsShareByCIP.map((cip: any) => {
      const total = completionsShareTotals.find((total: any) => total["University ID"] === cip["University ID"]);
      if (total) {
        const share = cip.Completions / total.Completions;
        return {
          "University ID": cip["University ID"],
          "University": cip["University"],
          "Completions Share Of University": share,
          "Total Completions": total.Completions,
          "Completions by CIP": cip.Completions
        };
      }
      return null; // In case there is no matching total data
    }).filter((result: any) => result !== null); // Filter out any null results


    completionShares.sort((a: any, b: any) => {
      if (a["Completions Share Of University"] !== b["Completions Share Of University"]) {
        return b["Completions Share Of University"] - a["Completions Share Of University"]; // Sort by businessCompletionPercentage (descending)
      } else {
        return b["Completions by CIP"] - a["Completions by CIP"];
      }
    });

    return {
      completionShares
    }
  }
};

export default materializer;
