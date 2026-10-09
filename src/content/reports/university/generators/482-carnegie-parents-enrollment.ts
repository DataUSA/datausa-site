// Converted from legacy canon_cms_generator #482 "Carnegie Parents (Enrollment)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 482,
  name: "Carnegie Parents (Enrollment)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Enrollment+Status,Carnegie+Parent,Year&locale=en&measures=Enrollment&time=Year.latest`,
  logic: (resp) => {
    let carnegieParentsEnrollmentList: any;
    carnegieParentsEnrollmentList = resp.data;

    return {
      carnegieParentsEnrollmentList
    }
  }
};

export default generator;
