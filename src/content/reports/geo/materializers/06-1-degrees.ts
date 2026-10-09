// Converted from legacy canon_cms_materializer #1 "Degrees" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 1,
  name: "Degrees",
  ordering: 6,
  allowed: "always",
  logic: (variables) => {
    const {degreesAvailable, degreeTypes} = variables;

    if(degreeTypes){
      return degreeTypes.reduce((obj: any, d: any) => {
        const id = d["Degree ID"];
        const available = degreesAvailable.includes(id);
        obj[`degree${id}`] = available ? d["Degree"] : false;
        return obj;
      }, {});
    }
    else{
      return{
        degree: false
      }
    }
  }
};

export default materializer;
