// Converted from legacy canon_cms_generator #457 "[Specialized Colleges] Degree Share of University" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 457,
  name: "[Specialized Colleges] Degree Share of University",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?${attrs.hierarchy}=${attrs.id}&cube=ipeds_completions&drilldowns=University,Year&locale=en&measures=Completions`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear && d.Completions >= 5);

    return {
      completionsShareByCIP: data
    }
  }
};

export default generator;
