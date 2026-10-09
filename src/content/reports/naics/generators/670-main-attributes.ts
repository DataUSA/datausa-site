// Converted from legacy canon_cms_generator #670 "Main Attributes" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 670,
  name: "Main Attributes",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Population&parents=true`,
  logic: (resp) => {
    const data = resp.data[0];
    return {
      parentId: data["Industry Sector ID"] || data["PUMS Industry ID"],
      parentName: data["Industry Sector"],
      isNotParent: "Industry Sub-Sector ID" in data,
      isParent: !("Industry Sub-Sector ID" in data) && !("Industry Group ID" in data)
    }
  }
};

export default generator;
