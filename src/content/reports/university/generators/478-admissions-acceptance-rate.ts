// Converted from legacy canon_cms_generator #478 "[Admissions] Acceptance Rate" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 478,
  name: "[Admissions] Acceptance Rate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Applicants+Total%2CAdmissions+Total%2CAdmissions+Enrolled+Total%2CNumber+of+Applicants+Submitting+SAT+Scores%2CPercent+of+Applicants+Submitting+SAT+Scores`,
  logic: (resp, {formatters}) => {



    if (!resp.data.length) return {admissionsVis: false};

    let data = resp.data.filter((d: any) => d["Admissions Total"] != null && d["Applicants Total"] != null)
    data = data.sort((a: any, b: any) => b["Year"] - a["Year"])

    // Current Year

    const applicantsYearCurr: any = data.length > 0 ? data[0]["Year"] : false;
    const applicantsTotal: any = data.length > 0 ? data[0]["Applicants Total"] : false;


    // const applicantsWithSATCurr: any = data.length > 0 ? data[0]["Percent of Applicants Submitting SAT Scores"] : false;
    // const applicantsWithSATCountCurr: any = data.length > 0 ? data[0]["Number of Applicants Submitting SAT Scores"] : false;

    const admissionsTotal: any = data.length > 0 ? data[0]["Admissions Total"] : false;
    const admissionsEnrolledTotal: any = data.length > 0 ? data[0]["Admissions Enrolled Total"] : false;

    if (!applicantsTotal && !admissionsTotal) return {admissionsVis: false};

    const enrollmentYield: any = admissionsEnrolledTotal ? (admissionsEnrolledTotal / admissionsTotal) * 100 : false;
    const acceptanceRate: any = admissionsTotal >= 0 ? (admissionsTotal / applicantsTotal) * 100 : false;

    // Previous Year

    const applicantsYearPrev: any = data.length > 1 ? data[1]["Year"] : false;
    const applicantsTotalPrev: any = data.length > 1 ? data[1]["Applicants Total"] : false;

    // const applicantsWithSATPrev = applicantsWithSATCurr ? false : data[1]["Percent of Applicants Submitting SAT Scores"];
    // const applicantsWithSATCountPrev = applicantsWithSATCountCurr ? false : data[1]["Number of Applicants Submitting SAT Scores"];

    const admissionsTotalPrev: any = data.length > 1 ? data[1]["Admissions Total"] : false;

    const acceptanceRatePrev: any = admissionsTotalPrev >= 0 ? (admissionsTotalPrev / applicantsTotalPrev) * 100 : false;
    const acceptanceRateDiff: any = acceptanceRate ? acceptanceRate - acceptanceRatePrev : false;

    // Growth

    const applicantsTotalGrowth = formatters.growth({curr: applicantsTotal, prev: applicantsTotalPrev});
    const admissionsTotalGrowth: any = admissionsTotalPrev ? formatters.growth({curr: admissionsTotal, prev: admissionsTotalPrev}) : false;

    // // SAT

    // const applicantsWithSAT: any = applicantsWithSATCurr ? applicantsWithSATCurr : applicantsWithSATPrev ? applicantsWithSATPrev : false;
    // const applicantsWithSATCount: any = applicantsWithSATCountCurr ? applicantsWithSATCountCurr : applicantsWithSATCountPrev ? applicantsWithSATCountPrev : false;
    // const applicantsWithSATYear: any = applicantsWithSATCurr ? applicantsYearCurr : applicantsWithSATPrev ? applicantsYearPrev : false;
    // const applicantsWithSATText = applicantsWithSAT ? `${formatters.abbreviate(applicantsWithSAT)}% of first-time enrollees submitted SAT scores with their applications.` : ""

    // Visibility vars

    const admissionsTextVis2Years: any = acceptanceRate >= 0 && acceptanceRatePrev >= 0 ? true : false
    const admissionsTextVisCurrYear: any = admissionsTextVis2Years === true ? false : acceptanceRate >= 0 && acceptanceRatePrev === false ? true : false

    // Applicants and admissions text

    let admissionsText: any = (admissionsTotal && admissionsTotalPrev) ? (admissionsTotal == admissionsTotalPrev ? "admissiomns remained the same" : `admissions ${formatters.grewWord(admissionsTotalGrowth)} by ${formatters.abbreviate(Math.abs(admissionsTotalGrowth))}%`) : false
    let applicantsText: any = (applicantsTotal && applicantsTotalPrev) ? (applicantsTotal == applicantsTotalPrev ? "the number of applicants remained the same" : `the number of applicants ${formatters.grewWord(applicantsTotalGrowth)} by ${formatters.abbreviate(Math.abs(applicantsTotalGrowth))}%`) : false
    let text

    if (applicantsText && admissionsText) {
      text = `Between ${applicantsYearPrev} and ${applicantsYearCurr}, ${applicantsText}, while ${admissionsText}.`
    }

    else if (applicantsText && !admissionsText) {
      text = `Between ${applicantsYearPrev} and ${applicantsYearCurr}, ${applicantsText}.`
    }

    else if (!applicantsText && admissionsText) {
      text = `Between ${applicantsYearPrev} and ${applicantsYearCurr}, ${admissionsText}.`
    }

    else {
      text = ""
    }


    return {
      applicantsYearCurr,
      acceptanceRate,
      applicantsTotal,
      admissionsTotal,
      admissionsTotalWord: admissionsTotal == 1 ? "student was" : "students were",
      acceptanceRateDiff,
      applicantsYearPrev,
      acceptanceRatePrev,

      applicantsNoDataVis: applicantsTotal > 0 && applicantsTotalPrev > 0 ? true : false,
      applicantsNoDataVis_: applicantsTotal > 0 && applicantsTotalPrev > 0 ? false : true,
      applicantsTotalGrowth: Math.abs(applicantsTotalGrowth),

      enrollmentYield: enrollmentYield ? enrollmentYield : false,
      admissionsVis: true,
      admissionsTextVis2Years,
      admissionsTextVisCurrYear,
      acceptanceRateVis: acceptanceRate >= 0 ? true : false,
      admissionsTotalVis: admissionsTotal >= 0 ? true : false,
      applicantsAndAdmissionsText: text,
    }
  }
};

export default generator;
