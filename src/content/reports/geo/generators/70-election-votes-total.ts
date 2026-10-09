// Converted from legacy canon_cms_generator #70 "Election - Votes (Total)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 70,
  name: "Election - Votes (Total)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?${attrs.hierarchyElectionSub}=${attrs.stateElectionId}&cube=Data_USA_President_election&drilldowns=Year,Party,${attrs.hierarchyElectionSub}&measures=Candidate+Votes`,
  logic: (resp, {libs}) => {
    const {nest, sum} = libs.d3;

    const data = resp.data;

    const order = nest()
      .key((d: any) => d.Party)
      .entries(data)
      .map((group: any) => {
        return [group.key, sum(group.values, (d: any) => d["Candidate Votes"])]
      })
      .sort((a: any, b: any) => b[1] - a[1])
      .map((d: any) => d[0]);

    return {
      electionStackOrder: order,
      electionYears: Array.from(new Set(data.map((d: any) => d["Year"]))).sort((a: any, b: any) => a - b)
    }
  }
};

export default generator;
