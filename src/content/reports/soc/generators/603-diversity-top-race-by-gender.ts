// Converted from legacy canon_cms_generator #603 "[Diversity] Top race by gender" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 603,
  name: "[Diversity] Top race by gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CRace,Gender&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&sort=Total+Population.desc&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {sum, nest, max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);

    const data = resp.data;

    nest()
      .key((d: any) => `${d.Race}`)
      .entries(data)
      .forEach((group: any) => {
        const total = sum(group.values, (d: any) => d["Total Population"]) 
        group.values.forEach((d: any) => {
            d["Total"] = total
        });
      });

    data.sort((a: any, b: any) => {return b["Total"] > a["Total"] ? 1 : -1})

    const topRace: any = data[0] ? data[0]["Race ID"] : false
    const topData = data.filter((d: any) => d["Race ID"] === topRace)

    const total: any = topData[0] ? topData[0]["Total"] : false
    const topWomenRace = topData.filter((d: any) => d["Gender ID"] === 2)[0] ? topData.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"] : 0
    const topMenRace = topData.filter((d: any) => d["Gender ID"] === 1)[0] ? topData.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"] : 0


    return {
      topMenRacePct: (topMenRace / total) * 100,
      topWomenRacePct: (topWomenRace / total) * 100,
    }
  }
};

export default generator;
