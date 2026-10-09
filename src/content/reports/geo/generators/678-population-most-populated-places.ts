// Converted from legacy canon_cms_generator #678 "Population (Most populated Places)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 678,
  name: "Population (Most populated Places)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_total_population_5&measures=Population&limit=3&sort=Population.desc&drilldowns=Year,Place&time=Year.latest`,
  logic: (resp) => {
    return {
      mostPopulatedPlaces: resp.data.map((d: any) => `<a href="/profile/geo/${d["Slug Place"] || d["ID Place"]}">${d["Place"]}</a>`)
    }
  }
};

export default generator;
