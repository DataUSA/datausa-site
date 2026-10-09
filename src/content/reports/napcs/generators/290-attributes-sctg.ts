// Converted from legacy canon_cms_generator #290 "Attributes (SCTG)" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 290,
  name: "Attributes (SCTG)",
  allowed: "always",
  api: attrs => `/api/napcs/${attrs.id}/sctg`,
  logic: (resp, {formatters}) => {
    const {list, lower} = formatters;

    return {
      showSCTG: resp.length ? true : false,
      sctgSub: resp.length ? `Freight data is provided using the SCTG product classification. The closest comparible products are ${ list(resp.map((d: any) => lower(d.name))) }` : false
    };
  }
};

export default generator;
