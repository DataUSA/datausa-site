// Converted from legacy canon_cms_generator #746 "Degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 746,
  name: "Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree,Year&locale=en&measures=Completions&sort=Completions.desc&include=${attrs.hierarchy}:${attrs.id}&time=Year.latest&exclude=Degree:20,21`,
  logic: (resp, {libs}) => {
    // /api/data?CIP=<id>&measures=Completions&drilldowns=Degree ID,Year&order=Completions&sort=desc

    const {max} = libs.d3;
    const currYear: any = resp.data[0] ? max(resp.data, (d: any) => d["Year"]) : false;
    const data: any = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === currYear) : false;

    return {
      degreesTop: data[0] ? `degree${data[0]["Degree ID"]}` : false,
      degreesAvailable: data[0] ? data.map((d: any) => d["Degree ID"]) : false,
      ultimoYear: currYear
    }
  }
};

export default generator;
