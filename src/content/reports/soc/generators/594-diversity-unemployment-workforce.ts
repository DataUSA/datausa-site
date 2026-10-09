// Converted from legacy canon_cms_generator #594 "[Diversity] Unemployment workforce" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 594,
  name: "[Diversity] Unemployment workforce",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year%2CGender&locale=en&measures=Total+Population,Total+Population+MOE+Appx&include=Workforce+Status:false;${attrs.hierarchy}:${attrs.id}&time=Year.latest`,
  logic: (resp, {libs}) => {
    // /api/data?drilldowns=Gender&measures=Total Population,Total Population MOE Appx&Workforce Status=false&<hierarchy>=<id>&Year=<pumsLatestYear>

    const {max, min, sum} = libs.d3;

    // latest year
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const total = sum(data, (d: any) => d["Total Population"]);

    const totalMale = data.filter((d: any) => d["Gender ID"] === 1);
    const totalFemale = data.filter((d: any) => d["Gender ID"] === 2);

    return {
      percentageUnemploymentMale: totalMale.length === 0 ? 0 : (totalMale[0]["Total Population"] / total) * 100,
      percentageUnemploymentFemale: totalFemale.length === 0 ? 0 : (totalFemale[0]["Total Population"] / total) * 100,
      totalUnemploymentMale: totalMale.length === 0 ? 0 : totalMale[0]["Total Population"],
      totalUnemploymentFemale: totalFemale.length === 0 ? 0 : totalFemale[0]["Total Population"],
      totalUnemploymentMaleMOE: totalMale.length === 0 ? 0 : totalMale[0]["Total Population MOE Appx"],
      totalUnemploymentFemaleMOE: totalFemale.length === 0 ? 0 : totalFemale[0]["Total Population MOE Appx"],
      totalUnemployment: total,
    }


  }
};

export default generator;
