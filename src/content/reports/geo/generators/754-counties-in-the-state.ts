// Converted from legacy canon_cms_generator #754 "Counties in the state" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 754,
  name: "Counties in the state",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygh_occupied_households_lacking_plumbing_5&include=State+County:${attrs.stateDataID}&measures=Households+by+Plumbing+Type&drilldowns=County`,
  logic: (resp) => {
    return {
      countyDataGeoIDs: resp.data.map((d: any) => d["County ID"])
    }
  }
};

export default generator;
