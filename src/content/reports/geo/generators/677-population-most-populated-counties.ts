// Converted from legacy canon_cms_generator #677 "Population (Most populated counties)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 677,
  name: "Population (Most populated counties)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_total_population_5&measures=Population&limit=3&sort=Population.desc&drilldowns=County,Year&time=Year.latest`,
  logic: (resp) => {
    return {
      mostPopulatedCounties: resp.data.map((d: any) => `<a href="/profile/geo/${d["Slug County"] || d["County ID"] }">${d["County"]}</a>`)
    }
  }
};

export default generator;
