// Converted from legacy canon_cms_generator #601 "[Population] Top PUMA" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 601,
  name: "[Population] Top PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&drilldowns=PUMA&measures=Total+Population&time=Year.latest&parents=true`,
  logic: (resp, {libs, formatters, variables}) => {
    const {id} = variables;
    const data = resp.data;
    const {commas} = formatters;

    const dataFilter = data.filter((d: any) => d["State ID"] === id)

    if (dataFilter.length !== 0) {

      const totalPopulationState = libs.d3.sum(dataFilter, (d: any) => d["Total Population"]);
  
      const dataSorted = dataFilter.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);
  
      const populationPuma1: string = `<a href="/profile/geo/${dataSorted[0]["PUMA ID"]}">${dataSorted[0]["PUMA"]}</a>`
      const populationPumaValue1 =  dataSorted[0]["Total Population"]
  
      const populationPuma2: string = `<a href="/profile/geo/${dataSorted[1]["PUMA ID"]}">${dataSorted[1]["PUMA"]}</a>`
      const populationPumaValue2 =  dataSorted[1]["Total Population"]
  
      const populationPuma3: string = `<a href="/profile/geo/${dataSorted[2]["PUMA ID"]}">${dataSorted[2]["PUMA"]}</a>`
      const populationPumaValue3 =  dataSorted[2]["Total Population"]
  
      const top3PopulationByPuma = dataSorted.slice(0, 3)
                                        .map((d: any, i: any) => `<a href="/profile/geo/${d["PUMA ID"]}">${d.PUMA}</a> (${commas(d["Total Population"])} people)`)
  
  
      return {
        totalPopulationState,
        populationPuma1,
        populationPumaValue1,
        populationPuma2,
        populationPumaValue2,
        populationPuma3,
        populationPumaValue3,
        top3PopulationByPuma
      };
    }

    else {
      return{
        totalPopulationState: false
      }
    }
  }
};

export default generator;
