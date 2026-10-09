// Converted from legacy canon_cms_generator #646 "[Diversity] Workforce by Age" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 646,
  name: "[Diversity] Workforce by Age",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Age&locale=en&measures=Record+Count,Total+Population&include=CIP2:${attrs.cip2};Workforce+Status:true&filters=Record+Count.gte.5&time=Year.latest&sort=Total+Population.desc`,
  logic: (resp, {libs}) => {
    const {sum} = libs.d3;
    const total = sum(resp.data, (d: any) => d["Total Population"]);

    const currCommonAge1: any = resp.data.length > 0 ? resp.data[0]["Age"] : false;
    const currCommonAge2: any = resp.data.length > 1 ? resp.data[1]["Age"] : false;
    const currCommonAge1Count: any = resp.data.length > 0 ? resp.data[0]["Total Population"] : false;
    const currCommonAge2Count: any = resp.data.length > 1 ? resp.data[1]["Total Population"] : false;

    return {
      currCommonAge1,
      currCommonAge2,
      currCommonAge1Pct: currCommonAge1Count / total * 100,
      currCommonAge2Pct: currCommonAge2Count / total * 100
    }
  }
};

export default generator;
