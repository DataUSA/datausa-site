// Converted from legacy canon_cms_generator #156 "Attributes (Parent) " (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 156,
  name: "Attributes (Parent) ",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&parents=true`,
  logic: (resp, {libs}) => {
    //api/data?CIP=<id>&measures=Completions&parents=true

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data[0] ?  resp.data.filter((d: any) => d["Year"] === latestYear)[0] : [];

    const url = (id: any, name: any) => `<a href='/profile/cip/${id}'>${name}</a>`;

    return {
      parentNameIPEDS: resp.data[0] ? "CIP2" in data ? url(data["CIP2 ID"], data["CIP2"]) : url(data["CIP ID"], data["CIP"]) : ""
    }
  }
};

export default generator;
