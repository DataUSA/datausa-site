// Converted from legacy canon_cms_generator #480 "[Admissions] SAT Scores" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 480,
  name: "[Admissions] SAT Scores",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,${attrs.hierarchy}&locale=en&measures=Number+of+Applicants+Submitting+SAT+Scores%2CPercent+of+Applicants+Submitting+SAT+Scores&parents=true`,
  logic: (resp, {formatters}) => {
    if (resp.data.length === 0) return {satAdmissions: false,
      applicantsWithSATText: ""
    };


    let data = resp.data.filter((d: any) => d["Percent of Applicants Submitting SAT Scores"] !== null && d["Number of Applicants Submitting SAT Scores"] !== null && d["Percent of Applicants Submitting SAT Scores"] > 0 && d["Number of Applicants Submitting SAT Scores"] > 0)

    data.sort((a: any, b: any) => b["Year"] - a["Year"])

    // Current Year

    const applicantsYearCurr: any = data.length > 0 ? data[0]["Year"] : false;
    const applicantsWithSATCurr: any = data.length > 0 ? data[0]["Percent of Applicants Submitting SAT Scores"] : false;
    const applicantsWithSATCountCurr: any = data.length > 0 ? data[0]["Number of Applicants Submitting SAT Scores"] : false;

    // Previous Year

    const applicantsYearPrev: any = data.length > 1 ? data[1]["Year"] : false;
    const applicantsWithSATPrev: any = data.length > 1 ? data[1]["Percent of Applicants Submitting SAT Scores"] : false;
    const applicantsWithSATCountPrev: any = data.length > 1 ? data[1]["Number of Applicants Submitting SAT Scores"] : false;

    // SAT

    const applicantsWithSAT: any = applicantsWithSATCurr >= 0 ? applicantsWithSATCurr : applicantsWithSATPrev ? applicantsWithSATPrev : false;
    const applicantsWithSATCount: any = applicantsWithSATCountCurr >= 0 ? applicantsWithSATCountCurr : applicantsWithSATCountPrev ? applicantsWithSATCountPrev : false;
    const applicantsWithSATYear: any = applicantsWithSATCurr >= 0 ? applicantsYearCurr : applicantsWithSATPrev ? applicantsYearPrev : false;
    const applicantsWithSATText = applicantsWithSAT ? `${formatters.abbreviate(applicantsWithSAT)}% of first-time enrollees submitted SAT scores with their applications.` : ""


    return {
      applicantsWithSAT: applicantsWithSAT >= 0 ? applicantsWithSAT : false,
      applicantsWithSATCount: applicantsWithSATCount >= 0 ? applicantsWithSATCount : false,
      applicantsWithSATText: applicantsWithSATText,
      applicantsWithSATYear: applicantsWithSATYear,
      satAdmissions: applicantsWithSATYear ? true : false,
    }
  }
};

export default generator;
