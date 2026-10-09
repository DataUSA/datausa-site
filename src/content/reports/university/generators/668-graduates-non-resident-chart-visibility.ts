// Converted from legacy canon_cms_generator #668 "[Graduates] Non-Resident Chart Visibility" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 668,
  name: "[Graduates] Non-Resident Chart Visibility",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_demographics_v3&drilldowns=Year,Gender&include=${attrs.hierarchy}:${attrs.id};IPEDS+Race%3Anonresident&locale=en&measures=Number+Of+Finishers,Graduation+Rate&time=Year.latest&sort=Number+Of+Finishers.desc&filters=Number Of Finishers.gte.5`,
  logic: (resp) => {
    const data = resp.data;

    const nonResidentVisibility = data.length === 0 || data[0]["Number Of Finishers"] === 0 ? false : true

    return {
      nonResidentVisibility
    };
  }
};

export default generator;
