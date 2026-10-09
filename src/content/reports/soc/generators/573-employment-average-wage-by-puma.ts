// Converted from legacy canon_cms_generator #573 "[Employment] Average Wage by PUMA" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 573,
  name: "[Employment] Average Wage by PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMA&locale=en&measures=Record+Count%2CAverage+Wage&top=3.Year.Average+Wage.desc&time=Year.latest&filters=Record+Count.gte.5&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;
    const dataFiltered = data.map(url);

    const list_: any = [];

    const name1 = dataFiltered.length > 0 && dataFiltered[0]
    const name2 = dataFiltered.length > 1 && dataFiltered[1]
    const name3 = dataFiltered.length > 2 && dataFiltered[2]

    const metric1 = formatters.salary(data.length > 0 && data[0]["Average Wage"])
    const metric2 = formatters.salary(data.length > 1 && data[1]["Average Wage"])
    const metric3 = formatters.salary(data.length > 2 && data[2]["Average Wage"])


    if (name1) {
      list_.push(`${name1} (${metric1})`);
    }

    if (name2) {
      list_.push(`${name2} (${metric2})`);
    }

    if (name3) {
      list_.push(`${name3} (${metric3})`);
    }


    return {
      topWage_pumasEBL: formatters.list(list_),
      topWageLastYear_pumasEBL: latestYear,
      top1WageName_pumasEBL: dataFiltered.length > 0 && dataFiltered[0]
    }


  }
};

export default generator;
