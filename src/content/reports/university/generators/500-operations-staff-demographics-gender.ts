// Converted from legacy canon_cms_generator #500 "[Operations] Staff Demographics (Gender)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 500,
  name: "[Operations] Staff Demographics (Gender)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Academic+Rank,Gender,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Instructional+Employees&sort=Total+Instructional+Employees.desc&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data;

    const {name} = variables;
    const {commas} = formatters;

    if(data.length > 0){
  
      const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
      const results = resp.data.filter((d: any) => d["Year"] === latestYear);
  
      const staffGenderYearCurr: any = results.length > 0 ? results[0]["Year"] : false
      const staffGenderTop1Name: any = results.length > 0 ? `${results[0]["Gender"]} ${results[0]["Academic Rank"]}` : false
      const staffGenderTop1Count: any = results.length > 0 ? results[0]["Total Instructional Employees"] : false
      const staffGenderTop2Name: any = results.length > 1 ? `${results[1]["Gender"]} ${results[1]["Academic Rank"]}` : false
      const staffGenderTop2Count: any = results.length > 1 ? results[1]["Total Instructional Employees"] : false
      const staffGenderTop3Name: any = results.length > 2 ? `${results[2]["Gender"]} ${results[2]["Academic Rank"]}` : false
      const staffGenderTop3Count: any = results.length > 2 ? results[2]["Total Instructional Employees"] : false
  
      let string_: any = ""
      let string2: any = ""
  
      if (staffGenderTop3Name) {
        string_ = `Most academics at ${name} are ${staffGenderTop1Name} (${formatters.commas(staffGenderTop1Count)}), ${staffGenderTop2Name} (${formatters.commas(staffGenderTop2Count)}), and ${staffGenderTop3Name} (${formatters.commas(staffGenderTop3Count)}).`;
        string2 = `In ${staffGenderYearCurr}, the most common demographic for instructional staff at ${name} was ${staffGenderTop1Name} with ${commas(staffGenderTop1Count)} employees, ${staffGenderTop2Name} with ${commas(staffGenderTop2Count)} employees, and ${staffGenderTop3Name} with ${commas(staffGenderTop3Count)} employees.`;
      }
  
      else if (staffGenderTop2Name){
        string_ = `Most academics at ${name} are ${staffGenderTop1Name} (${formatters.commas(staffGenderTop1Count)}), and ${staffGenderTop2Name} (${formatters.commas(staffGenderTop2Count)}).`;
        string2 = `In ${staffGenderYearCurr}, the most common demographic for instructional staff at ${name} was ${staffGenderTop1Name} with ${commas(staffGenderTop1Count)} employees, and ${staffGenderTop2Name} with ${commas(staffGenderTop2Count)} employees.`;
      }
  
      else if (staffGenderTop1Name){
        string_ = `Most academics at ${name} are ${staffGenderTop1Name} (${formatters.commas(staffGenderTop1Count)}).`;
        string2 = `In ${staffGenderYearCurr}, the most common demographic for instructional staff at ${name} was ${staffGenderTop1Name} with ${commas(staffGenderTop1Count)} employees.`;
      }
  
      return {
        staffGenderYearCurr,
        staffGenderTop1Name: staffGenderTop1Name ? staffGenderTop1Name : false,
        staffGenderTop1Count,
        staffGenderTop2Name: staffGenderTop2Name ? staffGenderTop2Name : false,
        staffGenderTop2Count,
        staffGenderTop3Name: staffGenderTop3Name ? staffGenderTop3Name : false,
        staffGenderTop3Count,
        staffGenderTopText: string_,
        staffGenderCommonText: string2
      }
    }
    else{
      return{
        staffGenderTop1Vis: false,
        staffGenderTopText: ""
      }
    }
  }
};

export default generator;
