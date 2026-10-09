// Converted from legacy canon_cms_generator #654 "[About] Employees (Occupations)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 654,
  name: "[About] Employees (Occupations)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMA&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Record+Count,Total+Population&top=3.Year.Total+Population.desc&time=Year.latest&filters=Record+Count.gte.5`,
  logic: (resp) => {
    const data = resp.data;

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;

    return {
      topLocations: data.length > 0 ? data.slice(0,3).map(url) : [],
    }
  }
};

export default generator;
