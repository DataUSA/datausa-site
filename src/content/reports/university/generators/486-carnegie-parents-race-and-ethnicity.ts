// Converted from legacy canon_cms_generator #486 "Carnegie Parents (Race and Ethnicity)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 486,
  name: "Carnegie Parents (Race and Ethnicity)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race,Year,Carnegie+Parent&locale=${attrs.locale}&measures=Enrollment&time=Year.latest&sort=Enrollment.desc`,
  logic: (resp) => {
    return {
      carnegieParentsRGList: resp.data
    }
  }
};

export default generator;
