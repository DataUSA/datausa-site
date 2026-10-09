// Converted from legacy canon_cms_generator #569 "[Employment] Workforce" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 569,
  name: "[Employment] Workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Gender,Year&include=Nation:01000US;${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Total+Population,Total+Population+Appx+MOE`,
  logic: (resp, {libs}) => {
    const {max, min, sum} = libs.d3;

    // first year
    const firstYear = min(resp.data, (d: any) => d["Year"]);
    const data2 = resp.data.filter((d: any) => d["Year"] === firstYear);
    const totalFirstYear = sum(data2, (d: any) => d["Total Population"]);

    // last year
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const total = sum(data, (d: any) => d["Total Population"]);

    const totalMale = data.filter((d: any) => d["Gender ID"] === 1);
    const totalFemale = data.filter((d: any) => d["Gender ID"] === 2);

    return {
      percentageMale: (totalMale[0]["Total Population"] / total) * 100,
      percentageFemale: (totalFemale[0]["Total Population"] / total) * 100,
      totalWorkforceMale: totalMale[0]["Total Population"],
      totalWorkforceFemale: totalFemale[0]["Total Population"],
      totalWorkforceMaleMOE: totalMale[0]["Total Population MOE Appx"],
      totalWorkforceFemaleMOE: totalFemale[0]["Total Population MOE Appx"],
      totalWorkforce2: total,
      latestYear: latestYear,
      firstYear: firstYear,
      growthWorkforce: ((total - totalFirstYear) / totalFirstYear) * 100,
      totalWorkforceFirst: totalFirstYear,
    }
  }
};

export default generator;
