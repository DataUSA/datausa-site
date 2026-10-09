// Converted from legacy canon_cms_generator #757 "[Educations] " (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 757,
  name: "[Educations] ",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions,Number+Of+Universities&exclude=Degree:20,21`,
  logic: (resp) => {
    const data = resp.data;

    const visibleAwardedDegrees = data.length > 1;

    return {
      visibleAwardedDegrees
    };
  }
};

export default generator;
