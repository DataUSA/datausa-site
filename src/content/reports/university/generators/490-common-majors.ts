// Converted from legacy canon_cms_generator #490 "Common Majors" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 490,
  name: "Common Majors",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=CIP6&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest&limit=10`,
  logic: (resp) => {
    const data = resp.data.slice(0, 5);
    ///api/data?university=<id>&measures=Completions&drilldowns=CIP6&order=Completions&sort=desc&Year=latest&limit=10

    return {
      commonMajorsIds: data.map((d: any) => d["CIP6 ID"]).join()
    };

  }
};

export default generator;
