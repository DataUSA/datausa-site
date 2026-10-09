// Converted from legacy canon_cms_generator #741 "[General] Pumas in States" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 741,
  name: "[General] Pumas in States",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=PUMA&measures=Total+Population&parents=true&time=Year.latest&include=State:${attrs.stateDataID}`,
  logic: (resp, {variables}) => {
    const data = resp.data;
    const {id, hierarchy} = variables;

    const pumasList = data.map((d: any) => d["PUMA ID"]);

    return {
      pumasList
    };
  }
};

export default generator;
