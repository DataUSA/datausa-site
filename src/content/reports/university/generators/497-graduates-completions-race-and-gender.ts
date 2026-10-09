// Converted from legacy canon_cms_generator #497 "[Graduates] Completions (Race and Gender)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 497,
  name: "[Graduates] Completions (Race and Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=IPEDS+Race,Year,Gender&${attrs.hierarchy}=${attrs.id}&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs, formatters}) => {
    const {lower, abbreviate, commas} = formatters;

    const filteredData = resp.data.filter((d: any) => d["IPEDS Race"] != "Unknown" && d["IPEDS Race"] != "Non-resident Alien" && d["Completions"] > 0);
    const latestYear = libs.d3.max(filteredData, (d: any) => d["Year"]);
    const filteredResults = filteredData.filter((d: any) => d["Year"] <= latestYear)

    //const filteredResults = data.filter((d: any) => d["IPEDS Race"] != "Unknown" && d["IPEDS Race"] != "Non-resident Alien" && d["Completions"] > 0);

    if (filteredResults.length === 0) return {completionsRGVis: false};

    const completionsRGTop1Name: any = filteredResults.length >= 1 ? `${filteredResults[0]["IPEDS Race"]} ${filteredResults[0]["Gender"] == "Women" ? "Female" : "Male"}` : false;
    const completionsRGTop1Count: any = filteredResults.length >= 1 ? filteredResults[0]["Completions"]: false;
    const completionsRGTop2Name: any = filteredResults.length >= 2 ? `${filteredResults[1]["IPEDS Race"]} ${filteredResults[1]["Gender"] == "Women" ? "Female" : "Male"}` : false;
    const completionsRGTop2Count: any = filteredResults.length >= 2 ? filteredResults[1]["Completions"] : false;
    const completionsRGTop3Name: any = filteredResults.length >= 3 ? `${filteredResults[2]["IPEDS Race"]} ${filteredResults[2]["Gender"] == "Women" ? "Female" : "Male"}` : false;
    const completionsRGTop3Count: any = filteredResults.length >= 3 ? filteredResults[2]["Completions"] : false;

    const completionsRGRatio = completionsRGTop1Count / completionsRGTop2Count;

    let string_: any = ""
    const morelessWord = completionsRGRatio < 0 ? "less" : "more";

    if (completionsRGTop2Count > 0) {
      string_ = `There were ${abbreviate(completionsRGRatio)} times ${morelessWord} ${lower(completionsRGTop1Name)} recipients than the next closest race/ethnicity group, ${lower(completionsRGTop2Name)} (${commas(completionsRGTop2Count)} degrees).`
    } 
    else {
      string_ = ""
    }


    return {
      completionsRGTop1Name: completionsRGTop1Count === 0 ? false : completionsRGTop1Name,
      completionsRGTop1Count,
      completionsRGTop2Name: completionsRGTop2Count === 0 ? false : completionsRGTop2Name,
      completionsRGTop2Count,
      completionsRGTop3Name: completionsRGTop3Count === 0 ? false : completionsRGTop3Name,
      completionsRGTop3Count,
      completionsRGRatio,
      completionsRGVis: true,
      completionsRGYear: latestYear,
      completionsRGText: string_
    }
  }
};

export default generator;
