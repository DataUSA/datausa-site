// Converted from legacy canon_cms_generator #128 "Election - Electoral College (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 128,
  name: "Election - Electoral College (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=Data_USA_Electoral_College_president&drilldowns=Year,Party&measures=Electoral+College+Votes&time=year.latest&sort=Electoral+College+Votes.desc`,
  logic: (resp, {libs}) => {
    const total = libs.d3.sum(resp.data, (d: any) => d["Electoral College Votes"]);
    resp.data.forEach((d: any) => {
      d["Total Votes"] = total;
    })

    return {
      electoralParty1: resp.data[0],
      electoralParty2: resp.data[1]
    }
  }
};

export default generator;
