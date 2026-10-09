// Converted from legacy canon_cms_generator #459 "Degree Sector" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 459,
  name: "Degree Sector",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Sector,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Number+Of+Universities&sort=Number+Of+Universities.desc`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : [];
    //const data = resp.data

    return {
      degreeTopSector: data[0] ? data[0]["Sector"] : false,
      degreeTopSectorValue: data[0] ? data[0]["Number Of Universities"] : false
    }
  }
};

export default generator;
