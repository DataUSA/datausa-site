// Converted from legacy canon_cms_generator #578 "Birthplace (Common PUMS)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 578,
  name: "Birthplace (Common PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.pumsHierarchy}:${attrs.pumsID};Nativity:2&measures=Total+Population&time=Year.latest&sort=Total+Population.desc&drilldowns=Year,Birthplace&limit=5`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {birthplaceYear: false};
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    const retObj: Record<string, any> = {
      birthplaceYear: resp.data[0].Year
    };

    nest()
      .key((d: any) => d["Birthplace ID"])
      .entries(resp.data)
      .map((group: any) => {
        return merge(group.values);
      })
      .sort((a: any, b: any) => b["Total Population"] - a["Total Population"])
      .slice(0, 3)
      .forEach((d: any, i: any) => {
        retObj[`birthplace${i + 1}Name`] = d.Birthplace;
        retObj[`birthplace${i + 1}Value`] = d["Total Population"];
     //   retObj[`birthplace${i + 1}Moe`] = d["Total Population MOE Appx"] ;
      });

    return retObj;
  }
};

export default generator;
