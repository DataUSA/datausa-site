// Converted from legacy canon_cms_generator #129 "Election - Votes" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 129,
  name: "Election - Votes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?${attrs.hierarchyElectionSubTemp}=${attrs.stateElectionIdTemp}&cube=Data_USA_President_election&debug=false&drilldowns=Year,Candidate,Party,${attrs.hierarchyElectionSubTemp}&measures=Candidate+Votes,Total+Votes&parents=false&sparse=false&time=year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const {nest, sum} = libs.d3;
    const {merge} = libs.d3plus;
    const {list} = formatters;
    const {hierarchy, hierarchyElectionSubTemp} = variables;

    const data = resp.data;
    
    const geoMap = Array.from(new Set(data.map((d: any) => d[`${hierarchyElectionSubTemp}`])));
    const total: any = []
    geoMap.map((g: any) => 
      total.push({
        "Geo": g,
        "Total": data.filter((p: any) => p[`${hierarchyElectionSubTemp}`] === g)[0]["Total Votes"]
      })
    );

    data.forEach((d: any) => d["Total Votes"] = total.reduce((sum: any, d: any) => sum + d.Total, 0));
    
    const nested = nest()
      .key((d: any) => d["Candidate ID"])
      .entries(data)
      .map((group: any) => {
        const obj = merge(group.values);
        obj["Total Votes"] = obj["Total Votes"] / group.values.length 
        obj.Party = Array.from(new Set(group.values.map((d: any) => d.Party.replace(/\sParty$/g, ""))));
        return obj;
      })
      .sort((a: any, b: any) => b["Candidate Votes"] - a["Candidate Votes"])
      .slice(0, 3);

    const retObj = nested.reduce((obj: any, d: any, i: any) => {
      obj[`electionVotes${i + 1}Name`] = d.Candidate;
      obj[`electionVotes${i + 1}ID`] = d["Candidate ID"];
      obj[`electionVotes${i + 1}Share`] = d["Candidate Votes"] / d["Total Votes"] * 100;
      obj[`electionVotes${i + 1}Party`] = `${list(d.Party)} Party`;
      return obj;
    }, {});

    nest()
      .key((d: any) => d[`${hierarchyElectionSubTemp} ID`])
      .entries(data)
      .forEach((group: any, i: any) => {
        retObj[`electionVotes${i + 1}GeoID`] = group.values[0][`${hierarchyElectionSubTemp} ID`];
        retObj[`electionVotes${i + 1}GeoName`] = group.values[0][`${hierarchyElectionSubTemp}`];
      })

    retObj.electionVotesYear = resp.data.length ? resp.data[0].Year : false;
    retObj.electionGeo = hierarchy === "Nation" ? `the ${geoMap}` : (geoMap.length > 45 ? "the states of United States" : list(geoMap))

    return retObj;
  }
};

export default generator;
