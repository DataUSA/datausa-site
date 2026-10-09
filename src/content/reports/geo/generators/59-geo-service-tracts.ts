// Converted from legacy canon_cms_generator #59 "Geo-Service (Tracts)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 59,
  name: "Geo-Service (Tracts)",
  allowed: "always",
  api: attrs => `${attrs.geoservice}relations/intersects/${attrs.id}?targetLevels=tract`,
  logic: (resp) => {
    return {
      tractIds: resp.map((d: any) => d.geoid)
    }
  }
};

export default generator;
