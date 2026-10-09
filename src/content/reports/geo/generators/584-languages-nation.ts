// Converted from legacy canon_cms_generator #584 "Languages (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 584,
  name: "Languages (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygl_language_spoken_at_home_by_english_ability_2016_5&measures=Languages+Spoken&time=Year.latest&sort=Languages+Spoken.desc&drilldowns=Language+Spoken+at+Home`,
  logic: (resp, {libs}) => {
    const measure: string = "Languages Spoken";

    const {sum} = libs.d3;
    const total = sum(resp.data, (d: any) => d[measure]);
    const foreignData = resp.data.filter((d: any) => d["Language Spoken at Home ID"] !== 0);
    const foreignPct = sum(foreignData, (d: any) => d[measure]) / total * 100;

    return {
      languagePctNation: foreignPct
    }
  }
};

export default generator;
