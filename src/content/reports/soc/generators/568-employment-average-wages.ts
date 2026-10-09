// Converted from legacy canon_cms_generator #568 "[Employment] Average Wages" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 568,
  name: "[Employment] Average Wages",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Gender,Year&include=Nation:01000US;${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Average+Wage%2CAverage+Wage+Appx+MOE&time=Year.latest`,
  logic: (resp, {libs}) => {
    // /api/data?drilldowns=Gender&measures=Average Wage,Average Wage Appx MOE&Workforce Status=true&Nation=01000US&<hierarchy>=<id>&Year=<pumsLatestYear>

    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const currData = resp.data.filter((d: any) => d["Year"] === currYear);

    //const currYear = resp.data[0].Year;
    //const currData = resp.data;

    const wageMale = currData.filter((d: any) => d["Gender ID"] === 1);
    const wageFemale = currData.filter((d: any) => d["Gender ID"] === 2);

    return {
      avgWageMale: wageMale[0]["Average Wage"],
      avgWageFemale: wageFemale[0]["Average Wage"],
      avgWageMaleMOE: wageMale[0]["Average Wage Appx MOE"],
      avgWageFemaleMOE: wageFemale[0]["Average Wage Appx MOE"],
      currYearWages: currYear,
    }
  }
};

export default generator;
