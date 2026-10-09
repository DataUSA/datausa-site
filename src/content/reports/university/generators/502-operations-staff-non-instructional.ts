// Converted from legacy canon_cms_generator #502 "[Operations] Staff (Non-Instructional)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 502,
  name: "[Operations] Staff (Non-Instructional)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_noninstructional&drilldowns=IPEDS+Occupation,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Noninstructional+Employees&sort=Total+Noninstructional+Employees.desc&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const {name} = variables;
    const {commas} = formatters;
    //const latestYear = data[0].Year;
    const staffOtherTop1Name: any = data.length > 0 ? data[0]["IPEDS Occupation"] : false
    const staffOtherTop1Count: any = data.length > 0 ? data[0]["Total Noninstructional Employees"] : false
    const staffOtherTop2Name: any = data.length > 0 ? data[1]["IPEDS Occupation"] : false
    const staffOtherTop2Count: any = data.length > 0 ? data[1]["Total Noninstructional Employees"] : false
    const staffOtherTop3Name: any = data.length > 0 ? data[2]["IPEDS Occupation"] : false
    const staffOtherTop3Count: any = data.length > 0 ? data[2]["Total Noninstructional Employees"] : false
    const staffOtherYear: any = data.length > 0 ? latestYear : false

    let string_: any = ""
    let string2: any = ""

    if (staffOtherTop3Count) {
      string_ = `In ${latestYear}, the most common positions for non-instructional staff at ${name} were ${staffOtherTop1Name} with ${commas(staffOtherTop1Count)} employees, ${staffOtherTop2Name} with ${commas(staffOtherTop2Count)} employees, and ${staffOtherTop3Name} with ${commas(staffOtherTop3Count)} employees.`;
      string2 = `The most common positions for non-instructional staff at ${name} are: ${staffOtherTop1Name}, with ${commas(staffOtherTop1Count)} employees, ${staffOtherTop2Name}, with ${commas(staffOtherTop2Count)} employees, and ${staffOtherTop3Name} with ${commas(staffOtherTop3Count)} employees.`
  
    }

    else if (staffOtherTop2Count) {
      string_ = `In ${latestYear}, the most common positions for non-instructional staff at ${name} were ${staffOtherTop1Name} with ${commas(staffOtherTop1Count)} employees, ${staffOtherTop2Name} with ${commas(staffOtherTop2Count)} employees.`;
      string2 = `The most common positions for non-instructional staff at ${name} are: ${staffOtherTop1Name}, with ${commas(staffOtherTop1Count)} employees, and ${staffOtherTop2Name}, with ${commas(staffOtherTop2Count)} employees.`
    }

    else if (staffOtherTop1Count) {
      string_ = `In ${latestYear}, the most common positions for non-instructional staff at ${name} was ${staffOtherTop1Name} with ${commas(staffOtherTop1Count)} employees.`;
      string2 = `The most common positions for non-instructional staff at ${name} is ${staffOtherTop1Name}, with ${commas(staffOtherTop1Count)} employees.`
    }

    //if (!data.length) return {};
    return {
      staffOtherTop1Name: staffOtherTop1Name ? staffOtherTop1Name : false,
      staffOtherTop1Count: staffOtherTop1Count ? staffOtherTop1Count : false,
      staffOtherTop2Name: staffOtherTop2Name ? staffOtherTop2Name : false,
      staffOtherTop2Count: staffOtherTop2Count ? staffOtherTop2Count : false,
      staffOtherTop3Name: staffOtherTop3Name ? staffOtherTop3Name : false,
      staffOtherTop3Count: staffOtherTop3Count ? staffOtherTop3Count : false,
      staffOtherYear: staffOtherYear ? staffOtherYear : false,
      staffOtherText: string_,
      staffOtherAboutText: string2
    }



  }
};

export default generator;
