// Converted from legacy canon_cms_generator #688 "Commute (Vehicles Nation)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 688,
  name: "Commute (Vehicles Nation)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=acs_ygsv_gender_of_workers_by_vehicles_available_5&drilldowns=Year,Vehicles+Available&include=Nation:01000US&locale=en&measures=Year,Commute+Means+by+Gender&time=Year.latest&sort=Commute+Means+by+Gender.desc`,
  logic: (resp) => {
    return {
      vehiclesNation: resp.data[0]["Vehicles Available ID"]
    }
  }
};

export default generator;
