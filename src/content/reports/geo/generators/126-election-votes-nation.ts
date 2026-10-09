// Converted from legacy canon_cms_generator #126 "Election - Votes (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 126,
  name: "Election - Votes (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?Nation=01000US&cube=Data_USA_President_election&debug=false&drilldowns=Candidate,Party,Year,Nation&measures=Candidate+Votes,Total+Votes&parents=false&sparse=false&time=Year.latest`,
  logic: (resp) => {
    const electoralCandidates = resp.data.filter((d: any) => {
      return ["Democratic", "Republican"].includes(d.Party);
    });

    return {
      electoralCandidates
    };
  }
};

export default generator;
