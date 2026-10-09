// Converted from legacy canon_cms_generator #571 "Most Similar Occupations" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 571,
  name: "Most Similar Occupations",
  allowed: "always",
  api: attrs => `/api/neighbors?cube=pums_5&measures=Average%20Wage,Record%20Count&dimension=Occupation&hierarchy=${attrs.hierarchy}&id=${attrs.id}&include=Workforce%20Status:true&filters=Record+Count.gte.5`,
  logic: (resp) => {
    return {mostSimilarOccup: resp.data}

  }
};

export default generator;
