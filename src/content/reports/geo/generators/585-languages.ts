// Converted from legacy canon_cms_generator #585 "Languages" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 585,
  name: "Languages",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygl_language_spoken_at_home_by_english_ability_2016_5&include=${attrs.hierarchy}:${attrs.id}&measures=Languages+Spoken&time=Year.latest&sort=Languages+Spoken.desc&drilldowns=Language+Spoken+at+Home,Year`,
  logic: (resp, {libs, formatters}) => {
    const measure: string = "Languages Spoken";
    const dimension: string = "Language Spoken at Home";

    const {abbreviate, commas} = formatters;
    const {sum} = libs.d3;
    const total = sum(resp.data, (d: any) => d[measure]);
    const foreignData = resp.data.filter((d: any) => d["Language Spoken at Home ID"]*1 !== 0 && d["Languages Spoken"]);
    const foreignPct = sum(foreignData, (d: any) => d[measure]) / total * 100;
    const languageList = foreignData.slice(0, 3).map((d: any) => `${d[dimension]} (${commas(d[measure])} households)`);

    if(total !== 0) {
      return {
        languageList,
        languageCount: foreignData.length,
        language1Name: foreignData.length > 0 && foreignData[0][dimension],
        language2Name: foreignData.length > 1 && foreignData[1][dimension],
        language3Name: foreignData.length > 2 && foreignData[2][dimension],
        language1Value: foreignData.length > 0 && foreignData[0][measure],
        language2Value: foreignData.length > 1 && foreignData[1][measure],
        language3Value: foreignData.length > 2 && foreignData[2][measure],
        language1Pct: foreignData.length > 0 && foreignData[0][measure] / total * 100,
        language2Pct: foreignData.length > 1 && foreignData[1][measure] / total * 100,
        language3Pct: foreignData.length > 2 && foreignData[2][measure] / total * 100,
        languagePct: foreignPct || 0,
        languagePctWord: foreignPct !== 0 ? `${abbreviate(foreignPct)}%` : "None",
        languageYear: foreignData.length > 0 && foreignData[0].Year
      }
    }
    else{
      return{
        language1Name:false,
        languagePctWord: "None",
      }
    }
  }
};

export default generator;
