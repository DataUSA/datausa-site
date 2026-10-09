// Converted from legacy canon_cms_generator #125 "Election - Senate Elections" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 125,
  name: "Election - Senate Elections",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?Special=0&State=${attrs.stateDataID}&cube=Data_USA_Senate_election&drilldowns=Year,Special,State&measures=Candidate+Votes`,
  logic: (resp) => {
    const retObj: Record<string, any> = {};
    retObj.senatorYears = resp.data.sort((a: any, b: any) => a.Year - b.Year)
      .map((c: any) => c["Year"]);
    return retObj;
  }
};

export default generator;
