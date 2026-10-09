// Converted from legacy canon_cms_generator #29 "Geo-Service (Neighbors)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 29,
  name: "Geo-Service (Neighbors)",
  allowed: "always",
  api: attrs => `/api/neighbors/?id=${attrs.id}&dimension=Geography&limit=100`,
  logic: (resp, {variables}) => {
    const {hierarchy} = variables;

    const data = resp.data;

    if (data.length >= 1){
      return {
        neighborIds: resp.data.map((d: any) => d.id),
        neighborNames: resp.data.map((d: any) => `<a href="/profile/geo/${d.slug}">${d.name}</a>`),
        neightborNamesVis: hierarchy != "Nation" && hierarchy != "Place" ? true : false
      }
    }
    else {
      return {
        neighborIds: "",
        neighborNames: "",
        neightborNamesVis: false 
      }
    }
  }
};

export default generator;
