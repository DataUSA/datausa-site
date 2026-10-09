// Converted from legacy canon_cms_generator #543 "[Employment] Most Common Jobs" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 543,
  name: "[Employment] Most Common Jobs",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&include=Workforce+Status:true;CIP2:${attrs.cip2}&locale=en&measures=Record+Count,Total+Population,Average+Wage&time=Year.latest&sort=Total+Population.desc&filter=Record+Count.gte.5&limit=11`,
  logic: (resp) => {
    const url = (d: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`;

    const commonOccupations = resp.data
      .map((d: any) => d["Detailed Occupation ID"]);
  
    const top5num = commonOccupations.slice(0, 5).length;
    const commonOccupationTopName: any = resp.data.length ? url(resp.data[0]) : false;
    const commonOccupationTopPopulation: any = resp.data.length ? resp.data[0]["Total Population"] : false;

    return {
      commonOccupations,
      commonOccupationTopName,
      commonOccupationTopPopulation,
      commonOccupations5text: top5num === 5 && commonOccupations.length > 5 ? "5 most common" : "",
      commonOccupationsSplit: commonOccupations.length === 11,
      commonOccupationsJoin: commonOccupations.length !== 11,
      commonOccupationPUMSnames: resp.data.slice(0, 3).map(url)
    }
  }
};

export default generator;
