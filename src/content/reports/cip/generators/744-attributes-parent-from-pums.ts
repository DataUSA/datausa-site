// Converted from legacy canon_cms_generator #744 "Attributes (Parent) from PUMS" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 744,
  name: "Attributes (Parent) from PUMS",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=CIP2&locale=${attrs.locale}&measures=Total+Population&include=CIP2:${attrs.cip2}&limit=1`,
  logic: (resp) => {
    const data = resp.data;
    const url = (id: any, name: any) => `<a href='/profile/cip/${id}'>${name}</a>`;

    return {
      parentNamePUMS: data[0] ? ("CIP2" in data[0] ? url(data[0]["CIP2 ID"], data[0]["CIP2"]) : url(data[0]["CIP ID"], data[0]["CIP"])) : "",
    };
  }
};

export default generator;
