// Converted from legacy canon_cms_generator #682 "Occupations" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 682,
  name: "Occupations",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&locale=en&measures=Record+Count,Total+Population&filters=Record+Count.gte.5&parents=true&time=Year.latest&exclude=Major%20Occupation%20Group:0000`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear && d["Detailed Occupation ID"] !== "");

    const listOccupations = data;

    return {
      listOccupations
    }
  }
};

export default generator;
