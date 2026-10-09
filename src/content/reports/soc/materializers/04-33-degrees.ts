// Converted from legacy canon_cms_materializer #33 "Degrees" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 33,
  name: "Degrees",
  ordering: 4,
  allowed: "always",
  logic: (variables) => {
    const {degreesAvailable, degreeTypes} = variables;

    return degreeTypes.reduce((obj: any, d: any, key: any) => {
      const id = d["ID Degree"];
      const customId = key + 1;
      const available = degreesAvailable.includes(id);
      obj[`degree${customId}`] = available ? d["Degree"] : false;
      return obj;
    }, {});
  }
};

export default materializer;
