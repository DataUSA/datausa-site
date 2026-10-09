// Converted from legacy canon_cms_generator #596 "[Diversity] Ethnicity" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 596,
  name: "[Diversity] Ethnicity",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMS+Ethnicity&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id};PUMS+Ethnicity+Parent:Hispanic&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5&time=Year.latest&sort=Total+Population.desc&parents=true`,
  logic: (resp, {libs, formatters}) => {
    const {sum} = libs.d3;
    const {list, abbreviate} = formatters;

    const latestYear = resp.data[0].Year;
    const data = resp.data;

    const total = sum(data, (d: any) => d["Total Population"]);

    const raceData = data.map((d: any) => `${d["PUMS Ethnicity"]}`);
    const popData = data.map((d: any) => d["Total Population"]);

    const ethnicityList: any = [];

    const ethnicity1Name = data.length > 0 && raceData[0]
    const ethnicity2Name = data.length > 1 && raceData[1]
    const ethnicity3Name = data.length > 2 && raceData[2]

    const ethnicity1Share = abbreviate(data.length > 0 && (popData[0] / total) * 100)
    const ethnicity2Share = abbreviate(data.length > 0 && (popData[1] / total) * 100)
    const ethnicity3Share = abbreviate(data.length > 0 && (popData[2] / total) * 100)

    if (ethnicity1Name) {
      ethnicityList.push(`${ethnicity1Name} (${ethnicity1Share}%)`);
    }

    if (ethnicity2Name) {
      ethnicityList.push(`${ethnicity2Name} (${ethnicity2Share})%`);
    }

    if (ethnicity3Name) {
      ethnicityList.push(`${ethnicity3Name} (${ethnicity3Share})%`);
    }


    return {
      ethnicity1Pop: data.length > 0 && popData[0],
      ethnicityList: list(ethnicityList)
    }
  }
};

export default generator;
