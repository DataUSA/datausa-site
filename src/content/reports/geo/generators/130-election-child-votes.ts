// Converted from legacy canon_cms_generator #130 "Election - Child Votes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 130,
  name: "Election - Child Votes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=Data_USA_President_election&drilldowns=Year,Candidate,Party,${attrs.electionCut}&measures=Candidate+Votes,Total+Votes&sort=Candidate+Votes.desc&Year=2020&slugs=Geography:${attrs.hierarchySub}`,
  logic: (resp, {libs, formatters}) => {
    const {nest, sum} = libs.d3;
    const {list} = formatters;
    const tops = nest()
      .key((d: any) => d["County ID"] || d["State ID"])
      .entries(resp.data)
      .map((group: any) => {
        const d = group.values[0];
        const other = group.values.filter((v: any) => v["Candidate ID"] === d["Candidate ID"]);
        d["Candidate Votes"] = sum(other, (o: any) => o["Candidate Votes"]);
        d.Party = Array.from(new Set(other.map((o: any) => o.Party)));
        d.Share = d["Candidate Votes"] / d["Total Votes"] * 100;
        return d;
      })
      .sort((a: any, b: any) => b.Share - a.Share);
    const diverging = tops.some((d: any) => d.Party.includes("Democratic")) && tops.some((d: any) => d.Party.includes("Republican"));
    const party = tops.length && tops[0].Party.includes("Democratic") ? "Democratic" : "Republican";

    const retObj: Record<string, any> = {
      presidentChildrenDiverging: diverging,
      presidentChildrenParty: party
    };

    tops
      .slice(0, 3)
      .forEach((d: any, i: any) => {
        retObj[`presidentChildrenCandidate${i + 1}Name`] = d.Candidate;
        retObj[`presidentChildrenCandidate${i + 1}Party`] = list(d.Party);
        retObj[`presidentChildrenCandidate${i + 1}Share`] = d.Share;
        retObj[`presidentChildrenCandidate${i + 1}Geo`] = `<a href='/profile/geo/${d["State Slug"] || d["County Slug"]}'>${d.County || d.State}</a>`;
      });


    return retObj;
  }
};

export default generator;
