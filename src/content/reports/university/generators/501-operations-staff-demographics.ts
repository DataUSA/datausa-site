// Converted from legacy canon_cms_generator #501 "[Operations] Staff Demographics" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 501,
  name: "[Operations] Staff Demographics",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Academic+Rank,Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Total+Instructional+Employees&sort=Total+Instructional+Employees.desc&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const results = data;
    const {name} = variables;
    const {commas} = formatters;

    const staffYearCurr: any = results.length > 0 ? results[0]["Year"] : false;
    const staffTop1Name: any = results.length > 0 ? results[0]["Academic Rank"] : false;
    const staffTop1Count: any = results.length > 0 ? results[0]["Total Instructional Employees"] : false;
    const staffTop2Name: any = results.length > 1 ? results[1]["Academic Rank"] : false;
    const staffTop2Count: any = results.length > 1 ? results[1]["Total Instructional Employees"] : false;
    const staffTop3Name: any = results.length > 2 ? results[2]["Academic Rank"] : false;
    const staffTop3Count: any = results.length > 2 ? results[2]["Total Instructional Employees"] : false;
    const staffTotal = results.reduce((acc: any, d: any) => d["Total Instructional Employees"] + acc, 0);

    let string_: any = ""
    let string2: any = ""
    if (staffTop3Name) {
      string_ = `In ${staffYearCurr}, the most common positions for instructional staff at ${name} were ${staffTop1Name} with ${commas(staffTop1Count)} employees, ${staffTop2Name} with ${commas(staffTop2Count)} employees, and ${staffTop3Name} with ${commas(staffTop3Count)} employees.`;
      string2 = `${name} employs ${commas(staffTop1Count)} ${formatters.plural(staffTop1Name)}, ${commas(staffTop2Count)} ${formatters.plural(staffTop2Name)} and ${commas(staffTop3Count)} ${formatters.plural(staffTop3Name)}.`
    }

    else if (staffTop2Name){
        string_ = `In ${staffYearCurr}, the most common positions for instructional staff at ${name} were ${staffTop1Name} with ${commas(staffTop1Count)} employees, and ${staffTop2Name} with ${commas(staffTop2Count)} employees.`;
        string2 = `${name} employs ${commas(staffTop1Count)} ${formatters.plural(staffTop1Name)}, ${commas(staffTop2Count)} ${formatters.plural(staffTop2Name)}.`
    }

    else if (staffTop1Name){
        string_ = `In ${staffYearCurr}, the most common positions for instructional staff at ${name} was ${staffTop1Name} with ${commas(staffTop1Count)} employees.`;
        string2 = `${name} employs ${commas(staffTop1Count)} ${formatters.plural(staffTop1Name)}.`
    }

    return {
      staffYearCurr,
      staffTop1Name,
      staffTop1Count,
      staffTop2Name,
      staffTop2Count,
      staffTop3Name,
      staffTop3Count,
      staffTotal,
      staffText: string_,
      staffOperationsText: string2
    }


  }
};

export default generator;
