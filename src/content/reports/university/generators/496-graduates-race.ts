// Converted from legacy canon_cms_generator #496 "[Graduates] Race" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 496,
  name: "[Graduates] Race",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year&${attrs.hierarchy}=${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    ///api/data?University=<id>&measures=Completions&drilldowns=IPEDS%20Race&order=Completions&sort=desc

    //const data = resp.data;
    const {abbreviate, lower, commas} = formatters;

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data_ = resp.data.filter((d: any) => d["Year"] === latestYear && d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown" && d["Completions"] > 0);

    const data = resp.data.filter((d: any) => d["Year"] === latestYear);


    if (!data_.length) return {
      gradsRaceByShareVis: false,
      gradsRaceByShareVis_: true,
      gradsRaceAboutText: "",
      gradsRaceRatioText: "",
      gradsRaceMostCommonText: ""
    };

    const results_ = data.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien");
    const results = results_.filter((d: any) => d["IPEDS Race"] != "Unknown");


    const gradsRace1Name = results[0]["IPEDS Race"];
    const gradsRace1Count = results[0]["Completions"];

    const gradsRace2Name = results[1]["IPEDS Race"];
    const gradsRace2Count = results[1]["Completions"];

    const gradsRace3Name = results[2]["IPEDS Race"];
    const gradsRace3Count = results[2]["Completions"];

    const gradsRaceUnknownCount = data.find((d: any) => d["IPEDS Race"] == "Unknown")["Completions"];
    const gradsRaceTotal = data.reduce((acc: any, d: any) => acc + d["Completions"], 0);
    const gradsRaceUnknownPercent: any = gradsRaceUnknownCount > 0 ? (gradsRaceUnknownCount / gradsRaceTotal) * 100 : false;

    const gradsRaceRatio = gradsRace1Count / gradsRace2Count;

    let string_: any = ""
    const morelessWord = gradsRaceRatio < 0 ? "less" : "more";


    if (gradsRace2Count > 0) {
      string_ = `There were ${abbreviate(gradsRaceRatio)} times ${morelessWord} ${lower(gradsRace1Name)} recipients than the next closest race/ethnicity group, ${lower(gradsRace2Name)} (${commas(gradsRace2Count)} degrees).`
    } 
    else {
      string_ = ""
    }


    let text: any = ""

    if (gradsRace2Count > 0) {
      text = `The most common race/ethnicity group of degree recipients was ${lower(gradsRace1Name)} (${commas(gradsRace1Count)} degrees), ${abbreviate(gradsRaceRatio)} times ${formatters.moreWord(gradsRaceRatio)} then the next closest race/ethnicity group, ${lower(gradsRace2Name)} (${commas(gradsRace2Count)} degrees).`
    }

    else if (gradsRace2Count == 0 && gradsRace1Count > 0) {
      text = `The most common race/ethnicity group of degree recipients was ${lower(gradsRace1Name)} (${commas(gradsRace1Count)} degrees).`
    }


    let text2: any = ""

    if(gradsRace1Count > 0) {
      text2 = `The most common race/ethnicity group of degree recipients at ${variables.name} is ${lower(gradsRace1Name)} (${commas(gradsRace1Count)} degrees awarded).`
    }


    return {
      gradsRace1Name: gradsRace1Count === 0 ? false : gradsRace1Name,
      gradsRace1Count,
      gradsRace2Name: gradsRace2Count === 0 ? false : gradsRace2Name,
      gradsRace2Count,
      gradsRace3Name: gradsRace3Count === 0 ? false : gradsRace3Name,
      gradsRace3Count,
      gradsRaceRatio,
      gradsRaceUnknownCount,
      gradsRaceUnknownPercent,
      gradsRaceRatioText: string_,
      gradsRaceMostCommonText: text2,
      gradsRaceByShareVis: true,
      gradsRaceByShareVis_: false,
      gradsRaceAboutText: text,
      gradsRaceYear: latestYear,
    }



  }
};

export default generator;
