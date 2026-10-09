// Converted from legacy canon_cms_generator #545 "[Employment] Highest Paid" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 545,
  name: "[Employment] Highest Paid",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&include=Workforce+Status:true;CIP2:${attrs.cip2}&locale=en&measures=Record+Count,Average+Wage&time=Year.latest&filter=Record+Count.gte.5&top=5.Year.Average+Wage.desc`,
  logic: (resp) => {
    const url = (d: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`;

    const highest: any = resp.data.length ? resp.data[0] : false;
    const payingOccupationHighestName: any = highest ? url(highest) : false;
    const payingOccupationHighestWage = highest["Average Wage"];

    return {
      payingOccupationHighestName,
      payingOccupationHighestWage,
      payingOccupationsSplit: resp.data.length === 11,
      payingOccupationsJoin: resp.data.length !== 11,
      payingOccupationPUMSnames: resp.data.slice(0, 3).map(url)
    }
  }
};

export default generator;
