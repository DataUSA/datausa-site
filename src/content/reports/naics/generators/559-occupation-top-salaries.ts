// Converted from legacy canon_cms_generator #559 "[Occupation] Top salaries" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 559,
  name: "[Occupation] Top salaries",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Average+Wage&top=5.Year.Average+Wage.desc&filters=Record+Count.gte.5&time=Year.latest&limit=10`,
  logic: (resp, {formatters}) => {
    // /api/data?<hierarchy>=<id>&drilldowns=Detailed Occupation&measures=Average Wage,Record%20Count&Workforce Status=true&Record Count>=5&order=Average Wage&sort=desc&Year=<pumsLatestYear>&limit=5
    //const latestYear = max(resp.data, (d: any) => d["ID Year"]);
    //const currData = resp.data.filter((d: any) => d["ID Year"] === latestYear);

    const currData = resp.data;
    const lastYearOccupationWage: any = currData[0] ? currData[0].Year : false

    const top3OccupationsWage = currData.slice(0,3).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a> (${formatters.salary(d["Average Wage"])})`)
    const top1OccupationsWage = currData.slice(0,1).map((d: any, i: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`)

    return {
      lastYearOccupationWage,
      top3OccupationsWage,
      top1OccupationsWage
    }
  }
};

export default generator;
