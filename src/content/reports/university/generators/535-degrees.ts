// Converted from legacy canon_cms_generator #535 "Degrees" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 535,
  name: "Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Degree%2CYear&locale=en&measures=Completions&sort=Completions.desc&include=${attrs.hierarchy}:${attrs.id}&exclude=Degree:20,21`,
  logic: (resp, {libs}) => {
    const data_ = resp.data.filter((d: any) => d.Completions > 0)
    const latestYear = libs.d3.max(data_, (d: any) => d["Year"]);
    const data = data_.filter((d: any) => d["Year"] === latestYear);

    //const data = resp.data;


    return {
      degreesTop: `degree${data[0]["Degree ID"]}`,
      degreesAvailable: data.map((d: any) => d["Degree ID"])
    }
  }
};

export default generator;
