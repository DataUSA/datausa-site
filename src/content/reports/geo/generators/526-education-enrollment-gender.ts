// Converted from legacy canon_cms_generator #526 "[Education] Enrollment (Gender)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 526,
  name: "[Education] Enrollment (Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Gender,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Enrollment&sort=Enrollment.desc&time=Year.latest`,
  logic: (resp, {libs}) => {
    ///api/data?Geography=<id>&measures=Enrollment&drilldowns=Gender&order=Enrollment&sort=desc

    if (!resp.data.length) return {
      lastYearEnrollmentGender: false,
      ipedsEnrollmentFemale: false,
      ipedsEnrollmentMale: false,
      ipedsEnrollmentSex: false,
    };

    const {max} = libs.d3;

    const lastYearEnrollmentGender: any = resp.data[0] ? max(resp.data, (d: any) => d.Year) : false

    const dataLastYear = resp.data.filter((d: any) => d["Year"] === lastYearEnrollmentGender)

    const male = dataLastYear.find((d: any) => d.Gender === "Men");
    const female = dataLastYear.find((d: any) => d.Gender === "Women");

    return {
      lastYearEnrollmentGender,
      ipedsEnrollmentFemale: female.Enrollment,
      ipedsEnrollmentMale: male.Enrollment,
      ipedsEnrollmentSex: dataLastYear[0].Gender === "Women" ? "women" : "men"
    }
  }
};

export default generator;
