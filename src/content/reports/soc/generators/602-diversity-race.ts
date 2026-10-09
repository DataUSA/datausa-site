// Converted from legacy canon_cms_generator #602 "[Diversity] Race" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 602,
  name: "[Diversity] Race",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year%2CRace&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&sort=Total+Population.desc&time=Year.latest`,
  logic: (resp, {libs}) => {
    const {sum, max} = libs.d3;

    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data;

    const total = sum(data, (d: any) => d["Total Population"]);

    const raceData = data.map((d: any) => `${d["Race"]}`);
    const popData = data.map((d: any) => d["Total Population"]);

    return {
      raceLatestYear: latestYear,
      race1Name: data.length > 0 && raceData[0],
      race2Name: data.length > 1 && raceData[1],
      race3Name: data.length > 2 && raceData[2],
      race1Share: data.length > 0 && (popData[0] / total) * 100,
      race2Share: data.length > 1 && (popData[1] / total) * 100,
      race3Share: data.length > 2 && (popData[2] / total) * 100,
    }
  }
};

export default generator;
