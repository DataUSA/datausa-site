// Converted from legacy canon_cms_generator #676 "Population (Most populated States)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 676,
  name: "Population (Most populated States)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&measures=Total+Population&&limit=3&sort=Total+Population.desc&drilldowns=State,Year&time=Year.latest`,
  logic: (resp) => {
    return {
      mostPopulatedStates: resp.data.map((d: any) => `<a href="/profile/geo/${d["Slug State"] || d["State ID"] }">${d["State"]}</a>`)
    }
  }
};

export default generator;
