// Converted from legacy canon_cms_generator #534 "[Enrollment] (Race and Gender)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 534,
  name: "[Enrollment] (Race and Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race,Gender,Level+Of+Study&include=Enrollment+Status:1;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Enrollment&sort=Enrollment.desc&time=Year.latest.2`,
  logic: (resp, {libs, formatters, variables}) => {
    ///api/data?University=<id>&measures=Enrollment&drilldowns=IPEDS%20Race,Gender,Level%20Of%20Study&order=Enrollment&sort=desc&Enrollment%20Status=1

    const {name} = variables;
    const {abbreviate} = formatters;
    const {sum} = libs.d3;

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);


    let results = data;
    let gradResults = results.filter((d: any) => d["Level Of Study"] == "Graduate");
    let undergradResults = results.filter((d: any) => d["Level Of Study"] == "Undergraduate");

    const enrollmentFTTotal = sum(results, (r: any) => r["Enrollment"]);
    const gradTotal = sum(gradResults, (r: any) => r["Enrollment"]);
    const undergradTotal = sum(undergradResults, (r: any) => r["Enrollment"]);

    results = results.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");
    gradResults = gradResults.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");
    undergradResults = undergradResults.filter((d: any) => d["IPEDS Race"] != "Non-resident Alien" && d["IPEDS Race"] != "Unknown");

    const enrollmentUndergradRG1 = undergradResults.length > 0 ? `${undergradResults[0]["IPEDS Race"]} ${undergradResults[0]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((undergradResults[0]["Enrollment"] / undergradTotal) * 100)}%)` : ""
    const enrollmentUndergradRG2 = undergradResults.length > 0 ? `${undergradResults[1]["IPEDS Race"]} ${undergradResults[1]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((undergradResults[1]["Enrollment"] / undergradTotal) * 100)}%)` : ""
    const enrollmentUndergradRG3 = undergradResults.length > 0 ? `${undergradResults[2]["IPEDS Race"]} ${undergradResults[2]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((undergradResults[2]["Enrollment"] / undergradTotal) * 100)}%)` : ""


    let string_: any = "";

    if(undergradResults.length > 0){
  
      if (undergradResults[2]["Enrollment"] > 0) {
        string_ = `Students enrolled at ${name} in full-time Undergraduate programs are most commonly ${enrollmentUndergradRG1}, followed by ${enrollmentUndergradRG2} and ${enrollmentUndergradRG3}.`;
      }
  
      else if (undergradResults[1]["Enrollment"] > 0) {
        string_ = `Students enrolled at ${name} in full-time Undergraduate programs are most commonly ${enrollmentUndergradRG1}, followed by ${enrollmentUndergradRG2}.`;
      }
  
      else if (undergradResults[0]["Enrollment"] > 0) {
        string_ = `Students enrolled at ${name} in full-time Undergraduate programs are most commonly ${enrollmentUndergradRG1}.`;
      }
  
      else {
        string_ = "";
      }
    }

    const enrollmentGradRG1 = gradResults.length > 0 ? `${gradResults[0]["IPEDS Race"]} ${gradResults[0]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((gradResults[0]["Enrollment"] / gradTotal) * 100)}%)` : ""
    const enrollmentGradRG2 = gradResults.length > 0 ? `${gradResults[1]["IPEDS Race"]} ${gradResults[1]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((gradResults[1]["Enrollment"] / gradTotal) * 100)}%)` : ""
    const enrollmentGradRG3 = gradResults.length > 0 ? `${gradResults[2]["IPEDS Race"]} ${gradResults[2]["Gender"] == "Men" ? "Male" : "Female"} (${abbreviate((gradResults[2]["Enrollment"] / gradTotal) * 100)}%)` : ""

    let string2: any = "";

    if(gradResults.length > 0) {

      if (gradResults[2]["Enrollment"] > 0) {
        string2 = `Students enrolled in full-time Graduate programs are most commonly ${enrollmentGradRG1}, followed by ${enrollmentGradRG2} and ${enrollmentGradRG3}.`;
      }
  
      else if (gradResults[1]["Enrollment"] > 0) {
        string2 = `Students enrolled in full-time Graduate programs are most commonly ${enrollmentGradRG1}, followed by ${enrollmentGradRG2}.`;
      }
  
      else if (gradResults[0]["Enrollment"] > 0) {
        string2 = `Students enrolled in full-time Graduate programs are most commonly ${enrollmentGradRG1}.`;
      }
  
      else {
        string2 = "";
      }

    }

    return {
      // enrollmentGradRG1,
      // enrollmentGradRG2,
      // enrollmentGradRG3,
      // enrollmentUndergradRG1,
      // enrollmentUndergradRG2,
      // enrollmentUndergradRG3,
      enrollmentUndergradRGText: string_,
      enrollmentGradRGText: string2,
      enrollmentLatestYear: latestYear,
    }
  }
};

export default generator;
