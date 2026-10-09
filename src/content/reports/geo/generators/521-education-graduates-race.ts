// Converted from legacy canon_cms_generator #521 "[Education] Graduates (Race)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 521,
  name: "[Education] Graduates (Race)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest.2`,
  logic: (resp, {libs, formatters}) => {
    if (!resp.data.length) return {gradsRaceYear: false};
    const {abbreviate, commas, list} = formatters;
    const {sum} = libs.d3;

    const gradsRaceYear: any = resp.data[0] ? libs.d3.max(resp.data, (d: any) => d["Year"]) : false

    const dataLastYear = resp.data.filter((d: any) => d["Year"] === gradsRaceYear)

    const data = dataLastYear.filter((d: any) => !["nonresident"].includes(d["IPEDS Race ID"]));
    const total = sum(data, (d: any) => d.Completions);
    const length = data.length;
    const arr = data.filter((d: any) => d["Completions"] > 0).slice(0, 4);
    //const ipedsRaceList = arr.map((d: any, i: any) => `${i === arr.length - 1 ? "and " : i === 1 ? "followed by " : ""}${d["IPEDS Race"]} (${commas(d["Completions"])} and ${abbreviate(d["Completions"] / total * 100)}%)`);

    const ipedsRaceList = arr.map((d: any, i: any) => `${d["IPEDS Race"]} (${commas(d["Completions"])} and ${abbreviate(d["Completions"] / total * 100)}%)`)


    return {
      gradsRaceYear,
      "Students graduating": length > 4 ? "Most students graduating" : "Students graduating" ,
      ipedsRaceList: list(ipedsRaceList),//ipedsRaceList.join(", "),
      gradsRace1Ratio: data[0]["Completions"] / data[1]["Completions"],
      gradsRace1Name: length > 0 ? data[0]["IPEDS Race"] : false,
      gradsRace2Name: length > 1 ? data[1]["IPEDS Race"] : false,
      gradsRace3Name: length > 2 ? data[2]["IPEDS Race"] : false,
      gradsRace1Value: length > 0 ? data[0]["Completions"] : false,
      gradsRace2Value: length > 1 ? data[1]["Completions"] : false,
      gradsRace3Value: length > 2 ? data[2]["Completions"] : false,
    }
  }
};

export default generator;
