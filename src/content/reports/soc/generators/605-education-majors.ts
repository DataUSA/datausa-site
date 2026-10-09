// Converted from legacy canon_cms_generator #605 "[Education] Majors" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 605,
  name: "[Education] Majors",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,CIP2&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count,Total+Population&sort=Total+Population.desc&time=Year.latest&limit=4`,
  logic: (resp, {formatters}) => {

    const data_ = resp.data.filter((d: any) => d["CIP2 ID"] !== "")

    const url = (d: any) => `<a href='/profile/cip/${d["CIP2 ID"]}'>${d["CIP2"]}</a>`;
    const dataPopulation = data_;
    const latestYear = dataPopulation[0].Year;

    const data = dataPopulation.map(url);

    const list_: any = [];

    const name1 = data.length > 0 && data[0]
    const name2 = data.length > 1 && data[1]
    const name3 = data.length > 2 && data[2]

    const people1 = dataPopulation.length > 0 && dataPopulation[0]["Total Population"]
    const people2 = dataPopulation.length > 1 && dataPopulation[1]["Total Population"]
    const people3 = dataPopulation.length > 2 && dataPopulation[2]["Total Population"]


    if (name1) {
      list_.push(`${name1} (${formatters.commas(people1)} people)`);
    }

    if (name2) {
      list_.push(`${name2} (${formatters.commas(people2)} people)`);
    }

    if (name3) {
      list_.push(`${name3} (${formatters.commas(people3)} people)`);
    }


    return {
      majorList: formatters.list(list_),
      majorsLatestYear: latestYear,
      major1Name: data.length > 0 && data[0]
    }


  }
};

export default generator;
