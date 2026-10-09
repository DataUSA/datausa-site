// Converted from legacy canon_cms_generator #509 "[Education] Enrollments" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 509,
  name: "[Education] Enrollments",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Year,Gender&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Enrollment&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const {max} = libs.d3;
    const {hierarchy} = variables;
    const {commas, abbreviate} = formatters;

    const data = resp.data;

    if(data.length > 0){
  
      const lastYearEnrollment: any = data[0] ? data[0]["Year"] : false;
  
      const dataLastYear = data.filter((d: any) => d["Year"] === lastYearEnrollment)
  
      const enrollmentsTotal: any = dataLastYear[0] ? libs.d3.sum(dataLastYear, (d: any) => d["Enrollment"]) : false;
  
      const menEnrollments = dataLastYear.filter((d: any) => d["Gender ID"] === 1)[0]["Enrollment"]
      const womenEnrollments = dataLastYear.filter((d: any) => d["Gender ID"] === 2)[0]["Enrollment"]
  
      const menEnrollmentsPct = (dataLastYear.filter((d: any) => d["Gender ID"] === 1)[0]["Enrollment"] / enrollmentsTotal) * 100
      const womenEnrollmentsPct = (dataLastYear.filter((d: any) => d["Gender ID"] === 2)[0]["Enrollment"] / enrollmentsTotal) * 100
  
      return {
        lastYearEnrollment: lastYearEnrollment,
        enrollmentsTotal: enrollmentsTotal,
        menEnrollments: menEnrollments,
        womenEnrollments: womenEnrollments,
        menEnrollmentsPct: menEnrollmentsPct,
        womenEnrollmentsPct: womenEnrollmentsPct,
        textEnrollment: lastYearEnrollment ? `The number of students enrolled in ${lastYearEnrollment} was ${commas(enrollmentsTotal)} (${abbreviate(menEnrollmentsPct)}% men and ${abbreviate(womenEnrollmentsPct)}% women).` : "",
      }
    }
    else{
      return{
        textEnrollment: "",
        lastYearEnrollment: false
      }
    }

  }
};

export default generator;
