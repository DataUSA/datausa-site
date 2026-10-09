// Converted from legacy canon_cms_generator #591 "[Industry] Highest Paying" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 591,
  name: "[Industry] Highest Paying",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Industry+Group,Year&locale=en&measures=Record+Count,Average+Wage&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&filters=Record+Count.gte.5&time=Year.latest&sort=Average+Wage.desc&top=4.Year.Average+Wage.desc`,
  logic: (resp, {formatters, variables}) => {
    const {name} = variables;
    const data = resp.data;

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;
    const dataFiltered = data.map(url);

    const top1IndWage = formatters.salary(data.length > 0 && data[0]["Average Wage"])
    const top2IndWage = formatters.salary(data.length > 1 && data[1]["Average Wage"])
    const top3IndWage = formatters.salary(data.length > 2 && data[2]["Average Wage"])

    const name1 = dataFiltered.length > 0 && dataFiltered[0]
    const name2 = dataFiltered.length > 1 && dataFiltered[1]
    const name3 = dataFiltered.length > 2 && dataFiltered[2]

    let answerString: any = ""

    if (name3) {
      answerString = `${name1} have the best average wages for ${name} (${top1IndWage}), followed by ${name2} (${top2IndWage}) and ${name3} (${top3IndWage}).`;
    }

    else if (name2) {
      answerString = `${name1} have the best average wages for ${name} (${top1IndWage}), followed by ${name2} (${top2IndWage}).`;
    }

    else if (name1) {
      answerString = `${name1} have the best average wages for ${name} (${top1IndWage}).`;
    }


    return {
      byIndustryWage: answerString,
      topWageIndLastYear: data[0].Year,
      top1IndWageName: name1,
      top1IndWage
    }


  }
};

export default generator;
