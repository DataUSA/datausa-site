// Converted from legacy canon_cms_generator #740 "[General] Counties in States" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 740,
  name: "[General] Counties in States",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygso_gender_by_occupation_c_5&drilldowns=County&measures=Workforce+by+Occupation+and+Gender&parents=true&include=State+County:${attrs.stateDataID}`,
  logic: (resp, {variables}) => {
    const data = resp.data;
    const {id, hierarchy} = variables;

    const countyList = data.map((d: any) => d["County ID"]);

    return {
      countyList
    };
  }
};

export default generator;
