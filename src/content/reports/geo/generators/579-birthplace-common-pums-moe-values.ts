// Converted from legacy canon_cms_generator #579 "Birthplace (Common PUMS)- MOE Values" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 579,
  name: "Birthplace (Common PUMS)- MOE Values",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Birthplace&measures=Total+Population,Total+Population+MOE+Appx&locale=en&parents=false&include=${attrs.pumsHierarchy}:${attrs.pumsID};Nativity:2`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {birthplaceYear: false};
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const maxYear = libs.d3.max(resp.data, (d: any) => d.Year)
    const dataFilter = resp.data.filter((d: any) => d.Year*1 === maxYear*1)


    return{
      maxYearBithPlace: maxYear,
      dataMOEBirthPlace: dataFilter.sort((a: any, b: any) => {return b["Total Population"] > a["Total Population"] ? 1 : -1}).slice(0,5)
    }

  }
};

export default generator;
