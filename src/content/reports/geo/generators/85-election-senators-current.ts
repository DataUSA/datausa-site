// Converted from legacy canon_cms_generator #85 "Election - Senators (Current)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 85,
  name: "Election - Senators (Current)",
  allowed: "always",
  api: attrs => `/api/civic/senator/${attrs.id}`,
  logic: (resp, {libs, formatters, variables}) => {
    const {nest} = libs.d3;
    const {list} = formatters;
    const {id} = variables;
    const classes: Record<string, any> = {
      "Martha McSally": 3,
      "Raphael Warnock": 3
    };

    const states = Array.from(new Set(resp.map((d: any) => d.State)));

    const arr = states.length > 10 ? [] : resp;
    const names: any = [];

    const retObj = arr.reduce((obj: any, d: any, i: any) => {
      const termUp = +d["Term up"];
      const year = d["Assumed office"].match(/([0-9]{4})$/)[0];
      obj[`senator${i + 1}Name`] = d.Senator;
      names.push(d.Senator);
      obj[`senator${i + 1}Party`] = d.Party || "";
      obj[`senator${i + 1}Class`] = classes[d.Senator] ? classes[d.Senator] : (termUp - 2018) % 6 === 0 ? 1 : (termUp - 2014) % 6 === 0 ? 2 : 3;
      obj[`senator${i + 1}Class`] = `<span class="u-visually-hidden">${obj[`senator${i + 1}Class`]}</span>`;
      obj[`senator${i + 1}NextYear`] = termUp;
      obj[`senator${i + 1}ImageRaw`] = d.Image;
      obj[`senator${i + 1}Sub`] = `Assumed office ${year.length == d["Assumed office"].length ? "in" : "on"} ${d["Assumed office"]}`;
      obj[`senator${i + 1}Elected`] = +year;
      obj[`senator${i + 1}Note`] = d.note;
      obj[`senator${i + 1}State`] = d.State;
      obj[`senator${i + 1}StateID`] = d["ID State"];
      if (d.note) obj[`senator${i + 1}Sub`] += `<br /><em>${d.note}</em>`;
      return obj;
    }, {});

    const parties = nest()
      .key((d: any) => d.Party)
      .entries(resp)
      .map((group: any) => {
        return {
          Party: group.key,
          Total: group.values.length
        }
      })
      .sort((a: any, b: any) => b.Total - a.Total);
  
    retObj.senatorNames = list(names);
  
    parties.forEach((p: any, i: any) => {
      retObj[`senateParty${i + 1}Name`] = p.Party;
      retObj[`senateParty${i + 1}Count`] = p.Total;
    });

    retObj.senatorTotal = arr.length > 0 ? arr.length : false;
    retObj.electionState = states.length < 10 ? list(states) : "the United States";
    retObj.electionStateIDs = states.length < 10 ? Array.from(new Set(resp.map((d: any) => d["ID State"]))) : false;
    retObj.singleState = arr.length === 2;
    retObj.singleStateNotPlace = retObj.singleState && !id.startsWith("16000US")

    return retObj;
  }
};

export default generator;
