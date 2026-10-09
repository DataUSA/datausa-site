// Converted from legacy canon_cms_generator #485 "[Enrollment] by Race and Ethnicity" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 485,
  name: "[Enrollment] by Race and Ethnicity",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race,Year&locale=${attrs.locale}&measures=Enrollment&sort=Enrollment.desc&include=${attrs.hierarchy}:${attrs.id}&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    ///api/data?University=<id>&measures=Enrollment&drilldowns=IPEDS%20Race&order=Enrollment&sort=desc

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const {abbreviate} = formatters;
    let results = data;

    if (!results.length) return {enrollmentRaceEthnicityVis: false};

    const u = data.find((d: any) => d["IPEDS Race"] == "Unknown");
    const alien = data.find((d: any) => d["IPEDS Race"] == "Non-resident Alien");
    const raceTotal = results.reduce((acc: any, r: any) => acc + r["Enrollment"], 0);

    results = results.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");

    //const raceList = results.map((d: any) => `${abbreviate((d["Enrollment"] / raceTotal) * 100)}% ${d["IPEDS Race"]}`);

    const raceList: any = [];
    let string_: any = ""

    results.forEach((d: any) => {
      string_ = `${abbreviate((d["Enrollment"] / raceTotal) * 100)}% ${d["IPEDS Race"]}`
      if(d["Enrollment"] > 0) {
       raceList.push(string_);
      }
    });

    const raceTop1Name = results[0]["IPEDS Race"];
    const raceTop1Count = results[0]["Enrollment"];
    const raceTop2Name = results[1]["IPEDS Race"];
    const raceTop2Count = results[1]["Enrollment"];
    const raceTop3Name = results[2]["IPEDS Race"];
    const raceTop3Count = results[2]["Enrollment"];

    const raceUnknownCount = u["Enrollment"];
    const raceUnknownPercent = (u["Enrollment"] / raceTotal) * 100;
    const raceAlienCount = alien["Enrollment"];

    return {
      raceAlienCount,
      raceList,
      raceListVis: raceList.length > 0 ? raceList : false,
      raceTop1Name: raceTop1Count === 0 ? false : raceTop1Name,
      raceTop1Count,
      raceTop2Name: raceTop2Count === 0 ? false : raceTop2Name,
      raceTop2Count,
      raceTop3Name: raceTop3Count === 0 ? false : raceTop3Name,
      raceTop3Count,
      raceUnknownCount,
      raceUnknownPercent,
      raceTopYear: latestYear,
      enrollmentRaceEthnicityVis: true,
    }
  }
};

export default generator;
