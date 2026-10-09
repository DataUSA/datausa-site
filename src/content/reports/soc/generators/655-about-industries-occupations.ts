// Converted from legacy canon_cms_generator #655 "[About] Industries (Occupations)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 655,
  name: "[About] Industries (Occupations)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Industry+Group&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Record+Count,Total+Population&top=2.Year.Total+Population.desc&time=Year.latest&filters=Record+Count.gte.5`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "");

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;

    return {
      topIndustry: data[0] ? url(data[0]) : false
    }
  }
};

export default generator;
