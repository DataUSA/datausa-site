// Converted from legacy canon_cms_generator #590 "[Industry] Highest Workforce" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 590,
  name: "[Industry] Highest Workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Industry+Group,Year&locale=en&measures=Record+Count%2CTotal+Population&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&filters=Record+Count.gte.5&time=Year.latest&sort=Total+Population.desc&limit=4`,
  logic: (resp, {libs, formatters, variables}) => {
    // /api/data?PUMS Occupation=<id>&drilldowns=Industry Group&measures=Total Population,Record Count&Record Count>=5&Workforce Status=true&order=Total Population&sort=desc&Year=<pumsLatestYear>&limit=3

    const {name} = variables;
    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "");

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;
    const dataFiltered = data.map(url);

    const totalWorkforce = libs.d3.sum(data, (d: any) => d["Total Population"]);

    const top1IndWorkforce = data.length > 0 && data[0]["Total Population"]
    const top2IndWorkforce = data.length > 1 && data[1]["Total Population"]
    const top3IndWorkforce = data.length > 2 && data[2]["Total Population"]

    const top1IndWorkforceShare = formatters.abbreviate((top1IndWorkforce / totalWorkforce) * 100)
    const top2IndWorkforceShare = formatters.abbreviate((top2IndWorkforce / totalWorkforce) * 100)
    const top3IndWorkforceShare = formatters.abbreviate((top3IndWorkforce / totalWorkforce) * 100)

    //return {
    //  socHighestPayingIndustries: data.map(url),
    //  topIndustry1Name: data.length > 0 && url(data[0])
    //}

    const list_: any = [];

    const name1 = dataFiltered.length > 0 && dataFiltered[0]
    const name2 = dataFiltered.length > 1 && dataFiltered[1]
    const name3 = dataFiltered.length > 2 && dataFiltered[2]

    let answerString: any = ""

    if (name3) {
      answerString = `${name1} employs the largest share of ${name} at ${top1IndWorkforceShare}%, followed by ${name2} with ${top2IndWorkforceShare}% and ${name3} with ${top3IndWorkforceShare}%.`;
    }

    else if (name2) {
      answerString = `${name1} employs the largest share of ${name} at ${top1IndWorkforceShare}%, followed by ${name2} with ${top2IndWorkforceShare}%.`;
    }

    else if (name1) {
      answerString = `${name1} employs the largest share of ${name} at ${top1IndWorkforceShare}%.`;
    }


    return {
      byIndustryWorkforce: answerString,
      topWorkforceIndLastYear: data[0].Year,
    }

  }
};

export default generator;
