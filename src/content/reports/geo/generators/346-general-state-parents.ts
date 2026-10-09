// Converted from legacy canon_cms_generator #346 "[General] State parents" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 346,
  name: "[General] State parents",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_household_income_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,${attrs.hierarchy}&measures=Household+Income&parents=true`,
  logic: (resp, {variables}) => {
    const data = resp.data
    const {hierarchy} = variables;

    const stateParentName = data[0][`State ${hierarchy}`]
    const stateParentId = data[0][`State ${hierarchy} ID`]

    return {
      stateParentName,
      stateParentId
    }
  }
};

export default generator;
