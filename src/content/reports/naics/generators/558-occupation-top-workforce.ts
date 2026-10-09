// Converted from legacy canon_cms_generator #558 "[Occupation] Top Workforce" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 558,
  name: "[Occupation] Top Workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population&sort=Total+Population.desc&filters=Record+Count.gte.5&time=Year.latest&limit=10`,
  logic: (resp, {formatters}) => {
    // /api/data?<hierarchy>=<id>&drilldowns=Detailed Occupation&measures=Total Population&Workforce Status=true&Record%20Count>=5&order=Total Population&sort=desc&Year=<pumsLatestYear>&limit=6
    //const lastData = resp.data.filter((d: any) => d["ID Year"] === latestYear);

    const lastData = resp.data;

    const lastYearOccupationWorkforce: any = lastData[0] ? lastData[0].Year : false

    lastData.sort((a: any, b: any) => {return b["Total Population"] > a["Total Population"] ? 1 : -1})

    const top3OccupationsWorkforce = lastData.slice(0,3).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${formatters.lower(d["Detailed Occupation"])}</a> (${formatters.commas(d["Total Population"])} people)`)
    const topOccupationsWorkforce = lastData.slice(0,3).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${formatters.lower(d["Detailed Occupation"])}</a>`)
    const top1OccupationsWorkforce = lastData.slice(0,1).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${(d["Detailed Occupation"])}</a> are the most common position with ${formatters.commas(d["Total Population"])} workers`)
    const top2and3OccupationsWorkforce = lastData.slice(1,3).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`)

    const topCommonOccupationIds = lastData.slice(0,5).map((d: any, i: any) => `${d["Detailed Occupation ID"]}`)

    return {
      lastYearOccupationWorkforce,
      topOccupationsWorkforce,
      top2and3OccupationsWorkforce,
      top3OccupationsWorkforce,
      top1OccupationsWorkforce,
      topCommonOccupationIds
    }
  }
};

export default generator;
