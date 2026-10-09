// Converted from legacy canon_cms_generator #609 "[Education] Education Levels" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 609,
  name: "[Education] Education Levels",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Group,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status%3Atrue&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&sort=Total+Population.desc&time=Year.latest&limit=4`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Group ID"] !== "");

    //const url = (d: any) => `<a href='/profile/naics/${d["ID Industry Group"]}'>${d["Industry Group"]}</a>`;
    //const dataFiltered = data.map(url);

    return {
      top1EdLevelName: data.length > 0 && data[0]["Group"],
      top2EdLevelName: data.length > 1 && data[1]["Group"],
      top3EdLevelName: data.length > 2 && data[2]["Group"],
      top1EdLevelPop: data.length > 0 && data[0]["Total Population"],
      top2EdLevelPop: data.length > 1 && data[1]["Total Population"],
      top3EdLevelPop: data.length > 2 && data[2]["Total Population"],
      EdLevelYear: data[0].Year
    }
  }
};

export default generator;
