// Converted from legacy canon_cms_generator #750 "[Helper] Neighbors		" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 750,
  name: "[Helper] Neighbors\t\t",
  allowed: "always",
  api: attrs => `api/neighbors?dimension=Geography&id=${attrs.id}`,
  logic: (resp) => {
    const data = resp.data;

    const neighborsList = data.map((d: any) => d.id).join(",");

    return{
      neighborsList
    }
  }
};

export default generator;
