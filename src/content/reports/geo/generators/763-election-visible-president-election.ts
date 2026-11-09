// Converted from legacy canon_cms_generator #763 "Election - Visible President Election" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 763,
  name: "Election - Visible President Election",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?${attrs.hierarchyElectionSubTemp}=${attrs.stateElectionIdTemp}&cube=Data_USA_President_election&debug=false&drilldowns=Year&measures=Candidate+Votes&parents=false&sparse=false`,
  logic: (resp, {variables}) => {
    const data = resp.data;

    // Areas with no state to cut by (the territories: no senators, so stateElectionIdTemp is "") get
    // nationwide results from the API, which ignores the empty cut: hide the section (QA DIFF-005).
    const visiblePresident = data.length > 0 && Boolean(variables.stateElectionIdTemp);

    return{
      visiblePresident
    }


  }
};

export default generator;
