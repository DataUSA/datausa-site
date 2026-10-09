// Converted from legacy canon_cms_generator #581 "[Wage Ranking] Position" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 581,
  name: "[Wage Ranking] Position",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,${attrs.hierarchy}&include=Workforce+Status:true&locale=en&measures=Record+Count,Average+Wage,Average+Wage+Appx+MOE&filters=Record+Count.gte.5`,
  logic: (resp, {libs, variables}) => {
    const {hierarchy, id} = variables;
    const {nest, max} = libs.d3;

    const occupationData = resp.data.filter((d: any) => d[`${hierarchy} ID`] === id);
    //const rankingLatestYear = resp.data[0]["Year"]
    const rankingLatestYear = occupationData[0] ? occupationData[0]["Year"] : 0;

    const data = resp.data.filter((d: any) => d["Year"] === rankingLatestYear);

    let data_ = data.map((d: any) => Object.assign({}, d))

        data_ = data_.sort((a: any, b: any) => b["Average Wage"] - a["Average Wage"])
        nest()
          .key((d: any) => d["Year"])
          .entries(data_)
          .forEach((group: any) => {
            group.values.forEach((d: any, i: any) => {
              d["Ranking"] = i + 1
            });
          });

    const dataFinal = data_.filter((d: any) => d[`${hierarchy} ID`] === id)

    const positionRanking = dataFinal[0]["Ranking"]

    return{
      rankingLatestYear,
      positionRanking,
    }
  }
};

export default generator;
