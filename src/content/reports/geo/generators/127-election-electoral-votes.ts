// Converted from legacy canon_cms_generator #127 "Election - Electoral Votes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 127,
  name: "Election - Electoral Votes",
  allowed: "always",
  api: attrs => `/api/data?drilldowns=Party&measures=Electoral%20College%20Votes&Year=2016&Geography=${attrs.id}`,
  logic: (resp) => {
    return {
      electoralVotes: resp.data.length ? resp.data[0]["Electoral College Votes"] : false,
      electoralVotesParty: resp.data.length ? resp.data[0].Party : false
    }
  }
};

export default generator;
