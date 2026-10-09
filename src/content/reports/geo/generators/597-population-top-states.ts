// Converted from legacy canon_cms_generator #597 "[Population] Top states" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 597,
  name: "[Population] Top states",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=Year,State&measures=Total+Population&time=Year.latest&sort=Total+Population.desc`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;
    const {commas} = formatters;

    const lastYearPopulation = data[0]["Year"]
    const totalPopulationUSA = libs.d3.sum(data, (d: any) => d["Total Population"]);

    const dataSorted = data.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);

    const populationState1: string = `<a href="/profile/geo/${dataSorted[0]["Slug State"] || dataSorted[0]["State ID"]}">${dataSorted[0]["State"]}</a>`
    const populationStateValue1 =  dataSorted[0]["Total Population"]

    const populationState2: string = `<a href="/profile/geo/${dataSorted[1]["Slug State"] || dataSorted[1]["State ID"]}">${dataSorted[1]["State"]}</a>`
    const populationStateValue2 =  dataSorted[1]["Total Population"]

    const populationState3: string = `<a href="/profile/geo/${dataSorted[2]["Slug State"] || dataSorted[2]["State ID"]}">${dataSorted[2]["State"]}</a>`
    const populationStateValue3 =  dataSorted[2]["Total Population"]

    const top3PopulationByState = data.slice(0, 3)
                                      .map((d: any, i: any) => `<a href="/profile/geo/${d["State ID"]}">${d.State}</a> (${commas(d["Total Population"])} people)`)


    return {
      totalPopulationUSA,
      lastYearPopulation,
      populationState1,
      populationStateValue1,
      populationState2,
      populationStateValue2,
      populationState3,
      populationStateValue3,
      top3PopulationByState
    };
  }
};

export default generator;
