// Converted from legacy canon_cms_generator #463 "[Degrees Awarded] Degrees (IPEDS)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 463,
  name: "[Degrees Awarded] Degrees (IPEDS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?include=${attrs.hierarchy}:${attrs.id}&cube=ipeds_completions&drilldowns=Degree,Year&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : [];

    let text: any = ""

    if (data[0]) {
      text = `The most common degree type these workers hold is a ${data[0]["Degree"]}.`
    }


    return {
      degreeMostCommon: data[0] ? data[0]["Degree"] : false,
      degreeMostCommonTop3: data.slice(0, 3).map((d: any) => d["Degree"]),
      degreesAwardedVis: data[0] ? true : false,
      degreesAwardedText: text,
    }


  }
};

export default generator;
