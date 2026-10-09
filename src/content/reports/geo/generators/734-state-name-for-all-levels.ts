// Converted from legacy canon_cms_generator #734 "State Name for all levels" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 734,
  name: "State Name for all levels",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=State&locale=en&measures=Total+Population&include=State:${attrs.stateDataID}`,
  logic: (resp, {variables}) => {
    const data = resp.data;

    const stateNameEmployment = variables.hierarchy === "Nation" ? "the United States" : (data[0] ? data[0]["State"] : false)

    return {
      stateNameEmployment
    }
  }
};

export default generator;
