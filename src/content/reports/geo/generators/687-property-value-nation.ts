// Converted from legacy canon_cms_generator #687 "Property Value (Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 687,
  name: "Property Value (Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_housing_median_value_5&include=Nation:01000US&measures=Property+Value&time=Year.latest&drilldowns=Year`,
  logic: (resp) => {
    return {
      propertyNation: resp.data[0]["Property Value"]
    }
  }
};

export default generator;
