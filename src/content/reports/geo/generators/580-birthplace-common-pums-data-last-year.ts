// Converted from legacy canon_cms_generator #580 "Birthplace (Common PUMS) - data last year" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 580,
  name: "Birthplace (Common PUMS) - data last year",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.pumsHierarchy}:${attrs.pumsID};Nativity:2&measures=Total+Population&drilldowns=Birthplace,Year&properties=Country%20Code&time=Year.latest&sort=Total+Population.desc&limit=5`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {birthplaceYear: false};
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const maxYear = libs.d3.max(resp.data, (d: any) => d.Year)
    const dataFilter = resp.data.filter((d: any) => d.Year*1 === maxYear*1)

    return{
      dataBirthPlace: dataFilter
    }

  }
};

export default generator;
