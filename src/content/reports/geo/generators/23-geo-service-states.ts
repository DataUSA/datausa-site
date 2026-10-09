// Converted from legacy canon_cms_generator #23 "Geo-Service (States)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 23,
  name: "Geo-Service (States)",
  allowed: "always",
  api: attrs => `${attrs.geoservice}relations/intersects/${attrs.id}?targetLevels=state&overlapSize=true`,
  logic: (resp) => {
    const states = resp.filter((d: any) => d.level === "state")
      .filter((d: any) => d.overlap_size > 0.00001)
      .sort((a: any, b: any) => b.overlap_size - a.overlap_size);
  
    return {
      stateIds: states.map((d: any) => d.geoid)
    }
  }
};

export default generator;
