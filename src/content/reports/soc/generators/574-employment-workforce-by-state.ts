// Converted from legacy canon_cms_generator #574 "[Employment] Workforce by State" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 574,
  name: "[Employment] Workforce by State",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,State&locale=en&measures=Record+Count,Total+Population&top=3.Year.Total+Population.desc&time=Year.latest&filters=Record+Count.gte.5&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true`,
  logic: (resp, {libs, formatters}) => {
    //const latestYear = libs.d3.max(resp.data, (d: any) => d["ID Year"]);
    const data = resp.data;
    const latestYear = data[0].Year;

    const url = (d: any) => `<a href='/profile/geo/${d["State ID"]}'>${d["State"]}</a>`;
    const dataFiltered = data.map(url);

    const list_: any = [];

    const name1 = dataFiltered.length > 0 && dataFiltered[0]
    const name2 = dataFiltered.length > 1 && dataFiltered[1]
    const name3 = dataFiltered.length > 2 && dataFiltered[2]

    const metric1 = formatters.commas(data.length > 0 && data[0]["Total Population"])
    const metric2 = formatters.commas(data.length > 1 && data[1]["Total Population"])
    const metric3 = formatters.commas(data.length > 2 && data[2]["Total Population"])


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
      topWorkforceList_statesEBL: formatters.list(list_),
      topWorkforceLastYear_statesEBL: latestYear,
    }




  }
};

export default generator;
