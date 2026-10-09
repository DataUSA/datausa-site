// Converted from legacy canon_cms_generator #155 "Attributes" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 155,
  name: "Attributes",
  allowed: "always",
  api: attrs => `/api/search?id=${attrs.id}&dimension=CIP`,
  logic: (resp) => {
    const data = resp.results[0];

    return {
      isNotCIP2: data.id.length !== 2,
      idCIP2: data.id.substring(0, 2),
      digitCIP: data.id.length
    };
  }
};

export default generator;
