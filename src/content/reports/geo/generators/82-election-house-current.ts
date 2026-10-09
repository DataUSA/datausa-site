// Converted from legacy canon_cms_generator #82 "Election - House (Current)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 82,
  name: "Election - House (Current)",
  allowed: "always",
  api: attrs => `/api/civic/representative/${attrs.id}`,
  logic: (resp, {libs, formatters, variables}) => {
    const {nest} = libs.d3;
    const {list} = formatters;
    const {hierarchy, name} = variables;

    const states = Array.from(new Set(resp.map((d: any) => d.State)));

    resp.forEach((d: any) => {
      d.Year = d["Assumed office"] && d["Assumed office"].length ? +d["Assumed office"].match(/([0-9]{4})/g)[0] : 0;
    });

    const statMax = 1;
    const reps = resp.length <= statMax ? resp.sort((a: any, b: any) => a.District - b.District) : [];
    const retObj: Record<string, any> = {};

    reps.forEach((d: any, i: any) => {
      retObj[`house${i + 1}Show`] = reps.length <= statMax;
      if (reps.length <= statMax) {
        retObj[`house${i + 1}Name`] = d.Member;
        retObj[`house${i + 1}Party`] = d.Party;
        retObj[`house${i + 1}ImageRaw`] = d.Image;
        retObj[`house${i + 1}Elected`] = d["Assumed office"];
        retObj[`house${i + 1}District`] = d.District !== "0" ? `District ${d.District}` : `${d.State} at-large`;
        retObj[`house${i + 1}Sub`] = d["Assumed office"].length ? `${d.Party} Party` : "";
      }
    });

    retObj.houseStats = reps.length > 0 ? reps.length : false ;
    retObj.houseTotal = resp.length;
    retObj.houseMemberWord = `member${resp.length > 1 ? "s" : ""}`;
    const isDistrict = reps.length === 1;
    retObj.houseMember = isDistrict ? retObj.house1Name : `${retObj.houseTotal} ${retObj.houseMemberWord}`;
    retObj.houseState = list(states);
    retObj.houseName = isDistrict ? name : retObj.houseState;
    retObj.houseDistricts = Array.from(new Set(resp.map((d: any) => d.District))).map((d: any) => +d).sort((a: any, b: any) => a - b);
    retObj.houseSingle = retObj.houseDistricts.length === 1;
    retObj.houseFilled = retObj.houseSingle && reps[0].Member !== "Vacant";
    retObj.houseVacant = retObj.houseSingle && reps[0].Member === "Vacant";
    retObj.houseMulti = !retObj.houseSingle;
    retObj.houseList = list(reps.map((r: any) => r.Member));
    retObj.houseSubtitle = ["Nation", "State"].includes(hierarchy) ? false : `Showing US representatives whose districts include part or all of ${name}.`;

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
  
    parties.forEach((p: any, i: any) => {
      retObj[`houseParty${i + 1}Name`] = p.Party.replace("undefined", "Vacant") || "Vacant";
      retObj[`houseParty${i + 1}Count`] = p.Total;
    });

    retObj.houseMinorities = `The house minority is made up of ${retObj.houseParty2Count} ${retObj.houseParty2Name} seats${retObj.houseParty3Count ? `, and ${retObj.houseParty3Count} ${retObj.houseParty3Name} seats.` : "."}`;

    return retObj;
  }
};

export default generator;
