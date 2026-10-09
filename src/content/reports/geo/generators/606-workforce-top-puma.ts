// Converted from legacy canon_cms_generator #606 "[Workforce] Top PUMA" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 606,
  name: "[Workforce] Top PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=PUMA&measures=Total+Population&time=Year.latest&parents=true&Workforce+Status=true`,
  logic: (resp, {libs, formatters, variables}) => {
    const {id} = variables;
    const data = resp.data;
    const {commas} = formatters;

    const dataFilter = data.filter((d: any) => d["State ID"] === id)
    const totalWorkforceState = libs.d3.sum(dataFilter, (d: any) => d["Total Population"]);

    const dataSorted = dataFilter.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);

    const top3WorkforceByPuma = dataSorted.slice(0, 3)
                                      .map((d: any, i: any) => `<a href="/profile/geo/${d["PUMA ID"]}">${d.PUMA}</a> (${commas(d["Total Population"])} people)`)


    return {
      totalWorkforceState: totalWorkforceState > 0 ? totalWorkforceState : false,
      top3WorkforceByPuma
    };
  }
};

export default generator;
