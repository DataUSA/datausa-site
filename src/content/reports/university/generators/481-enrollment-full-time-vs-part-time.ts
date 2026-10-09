// Converted from legacy canon_cms_generator #481 "[Enrollment] Full-Time vs Part-Time" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 481,
  name: "[Enrollment] Full-Time vs Part-Time",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=Year,Enrollment Status,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Enrollment&time=Year.latest`,
  logic: (resp, {libs}) => {
    ///api/data?University=<id>&measures=Enrollment&drilldowns=Enrollment%20Status

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    if (!data.length) return {enrollmentFTPTVis: false};


    const fulltime = data.find((d: any) => d["Enrollment Status"] == "Full time") || {"Enrollment": 0};
    const parttime = data.find((d: any) => d["Enrollment Status"] == "Part time") || {"Enrollment": 0};

    //const enrollmentYearCurr = fulltime["Year"];
    const enrollmentFTCount = fulltime["Enrollment"];
    const enrollmentPTCount = parttime["Enrollment"];
    const enrollmentTotal = fulltime["Enrollment"] + parttime["Enrollment"];

    const enrollmentFTPercent = (fulltime["Enrollment"] / enrollmentTotal) * 100;

    return {
      enrollmentYearCurr: latestYear,
      enrollmentTotal,
      enrollmentFTCount,
      enrollmentPTCount,
      enrollmentFTPercent,
      enrollmentFTPTVis: true,
    }
  }
};

export default generator;
