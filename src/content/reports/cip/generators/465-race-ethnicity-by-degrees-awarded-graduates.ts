// Converted from legacy canon_cms_generator #465 "[Race & Ethnicity by Degrees Awarded] Graduates" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 465,
  name: "[Race & Ethnicity by Degrees Awarded] Graduates",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS Race%2CYear&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs, formatters, variables}) => {
    const {parentName} = variables;
    const {abbreviate, commas} = formatters;
    const {sum, max} = libs.d3;

    if(!resp.data[0]){
      return {
        raceEthnicityByDegreesVis: false,
        "Students graduating": false,
        ipedsRaceList: false,
        gradsRace1Ratio: false,
        gradsRace1Name: false,
        gradsRace2Name: false,
        gradsRace3Name: false,
        gradsRace1Value: false,
        gradsRace2Value: false,
        gradsRace3Value: false,
        gradsRaceYear: false,
        gradsRaceText: ""
      }
    }
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    //const data = resp.data

    // const data = resp.data.filter((d: any) => !["nonresident"].includes(d["ID IPEDS Race"]));
    const total = sum(data, (d: any) => d.Completions);
    const length = data.length;
    const arr = data.slice(0, 4);
    const ipedsRaceList = arr.map((d: any, i: any) => `${i === arr.length - 1 ? "and " : i === 1 ? "followed by " : ""}${d["IPEDS Race"]} (${commas(d["Completions"])} and ${abbreviate(d["Completions"] / total * 100)}%)`);

    let gradsRaceText: any = ""

    const gradsRace1Name: any = length > 0 && data[0]["Completions"] != 0 ? data[0]["IPEDS Race"] : false

    if (gradsRace1Name){
      gradsRaceText = `${gradsRace1Name} students earned the largest share of the degrees with this major.`
    }


    return {
      raceEthnicityByDegreesVis: true,
      "Students graduating": length > 4 ? "Most students graduating" : "Students graduating" ,
      ipedsRaceList: ipedsRaceList.join(", "),
      gradsRace1Ratio: data[0]["Completions"] / data[1]["Completions"],
      gradsRace1Name,
      gradsRace2Name: length > 1 && data[1]["Completions"] != 0 ? data[1]["IPEDS Race"] : false,
      gradsRace3Name: length > 2 && data[2]["Completions"] != 0 ? data[2]["IPEDS Race"] : false,
      gradsRace1Value: length > 0 ? data[0]["Completions"] : false,
      gradsRace2Value: length > 1 ? data[1]["Completions"] : false,
      gradsRace3Value: length > 2 ? data[2]["Completions"] : false,
      gradsRaceYear: data[0].Year,
      gradsRaceText
    }


  }
};

export default generator;
