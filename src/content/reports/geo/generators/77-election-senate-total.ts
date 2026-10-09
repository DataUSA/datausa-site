// Converted from legacy canon_cms_generator #77 "Election - Senate (Total)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 77,
  name: "Election - Senate (Total)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=Data_USA_Senate_election&drilldowns=Year%2CParty&measures=Candidate+Votes`,
  logic: (resp, {libs}) => {
    const {nest, sum} = libs.d3;

    const order = nest()
      .key((d: any) => d.Party)
      .entries(resp.data)
      .map((group: any) => {
        return [group.key, sum(group.values, (d: any) => d["Candidate Votes"])]
      })
      .sort((a: any, b: any) => b[1] - a[1])
      .map((d: any) => d[0]);

    return {
      senateStackOrder: order
    }
  }
};

export default generator;
