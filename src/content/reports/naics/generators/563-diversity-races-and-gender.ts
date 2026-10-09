// Converted from legacy canon_cms_generator #563 "[Diversity] Races and gender" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 563,
  name: "[Diversity] Races and gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Year,Race&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population%2CAverage+Wage&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {nest, sum, max} = libs.d3;

    const currData = resp.data;
    const lastYearRaces = currData[0].Year
    const totalRaces = sum(currData, (d: any) => d["Total Population"]);

    nest()
      .key((d: any) => d.Race)
      .entries(currData)
      .forEach((group: any) => {
        const total = sum(group.values, (d: any) => d["Total Population"]);
        group.values.forEach((d: any) => d.total = total);
      });
  
    const topRaceValue = max(currData, (d: any) => d.total)
    const topRaceName = currData.filter((d: any) => d.total === topRaceValue)[0]["Race"]
    const topRacePct = (topRaceValue/totalRaces) * 100

    const dataTopRace = currData.filter((d: any) => d["Race"] === topRaceName)
    const womenRacePct = (dataTopRace.filter((d: any) => d["Gender ID"] === 2)[0]["Total Population"] / topRaceValue) * 100
    const menRacePct = (dataTopRace.filter((d: any) => d["Gender ID"] === 1)[0]["Total Population"] / topRaceValue) * 100

    currData.sort((a: any, b: any) => {return b.total > a.total ? 1 : -1})

    const top2Race: any = currData[2] ? currData[2]["Race"] : false
    const top3Race: any = currData[4] ? currData[4]["Race"] : false

    return {
      lastYearRaces,
      topRaceValue,
      topRaceName,
      topRacePct,
      womenRacePct,
      menRacePct,
      top2Race,
      top3Race
    };
  }
};

export default generator;
