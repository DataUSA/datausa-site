// Converted from legacy canon_cms_generator #720 "[General] Tracts in the county" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 720,
  name: "[General] Tracts in the county",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_occupied_households_lacking_plumbing_5&include=County+Tract:${attrs.id}&drilldowns=Tract&measures=Households+by+Plumbing+Type`,
  logic: (resp, {variables}) => {
    const data = resp.data;
    const {id, hierarchy} = variables;


    const tractList = data[0] ? data.map((d: any) => d["Tract ID"]) : [];

    return {
      tractList
    };
  }
};

export default generator;
