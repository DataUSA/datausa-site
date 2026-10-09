// Converted from legacy canon_cms_generator #735 "Foreign-Born" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 735,
  name: "Foreign-Born",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygf_place_of_birth_for_foreign_born_5&measures=Foreign-Born Citizens&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year`,
  logic: (resp, {libs}) => {
    const data = resp.data;

    const foreignbornCurrYear: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false
    const foreignbornPrevYear = foreignbornCurrYear - 1

    const foreignbornTotal = data.filter((d: any) => d.Year === foreignbornCurrYear)[0]["Foreign-Born Citizens"]
    const foreignbornTotalPrev = data.filter((d: any) => d.Year === foreignbornPrevYear)[0]["Foreign-Born Citizens"]

    return {
      foreignbornTotal,
      foreignbornTotalPrev,
      foreignbornCurrYear,
      foreignbornPrevYear
    };

  }
};

export default generator;
