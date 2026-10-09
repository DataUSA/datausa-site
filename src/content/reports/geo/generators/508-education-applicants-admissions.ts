// Converted from legacy canon_cms_generator #508 "[Education] Applicants & Admissions" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 508,
  name: "[Education] Applicants & Admissions",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Applicants+Total%2CAdmissions+Total%2CAdmissions+Enrolled+Total&time=Year.latest`,
  logic: (resp, {libs, variables}) => {
    ///api/data?Geography=<id>&drilldowns=Year&measures=Applicants Total,Admissions Total,Admissions Enrolled Total

    const {max} = libs.d3;
    const {hierarchy} = variables

    const data = resp.data;

    const lastYearAdmission: any = data[0] ? data[0]["Year"] : undefined

    const dataLastYear = data.filter((d: any) => d["Year"] === lastYearAdmission)

    dataLastYear.forEach((d: any) => {
      d["Applicants Admitted"] = (d["Admissions Total"] / d["Applicants Total"]) * 100
      d["Admitted who Enrolled"] = (d["Admissions Enrolled Total"] / d["Admissions Total"]) * 100
    });

    const applicantAdmitted: any = dataLastYear[0] ? dataLastYear[0]["Applicants Admitted"] : false
    const admittedEnrolled: any = dataLastYear[0] ? dataLastYear[0]["Admitted who Enrolled"] : false

    return {
      lastYearAdmission: lastYearAdmission,
      applicantAdmitted: applicantAdmitted,
      admittedEnrolled: admittedEnrolled
    }
  }
};

export default generator;
