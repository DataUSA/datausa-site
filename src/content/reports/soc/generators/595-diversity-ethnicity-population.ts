// Converted from legacy canon_cms_generator #595 "[Diversity] Ethnicity - Population" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 595,
  name: "[Diversity] Ethnicity - Population",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMS+Ethnicity+Parent&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&time=Year.latest&sort=Total+Population..desc`,
  logic: (resp, {libs}) => {
    const {sum} = libs.d3;

    const latestYear = resp.data[0].Year;
    const data = resp.data;

    const total = sum(data, (d: any) => d["Total Population"])

    const dataHispanic = data.filter((d: any) => d["PUMS Ethnicity Parent"] === "Hispanic")
    const dataNotHispanic = data.filter((d: any) => d["PUMS Ethnicity Parent"] === "Not Hispanic")

    const totalHispanic = dataHispanic[0]["Total Population"];
    const totalNotHispanic = dataNotHispanic[0]["Total Population"];

    return {
      latestYearRace: latestYear,
      totalHispanic,
      totalNotHispanic,
      hispanicShare: (totalHispanic / total) * 100,
      nonHispanicShare: (totalNotHispanic / total) * 100,
    }
  }
};

export default generator;
