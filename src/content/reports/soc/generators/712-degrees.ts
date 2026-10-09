// Converted from legacy canon_cms_generator #712 "Degrees" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 712,
  name: "Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Degree&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population&sort=Total+Population.desc&filters=Record+Count.gte.5&time=Year.latest`,
  logic: (resp, {libs}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    return {
      degreesTop: `degree${data[0]["Degree ID"]}`,
      degreesAvailable: data.map((d: any) => d["Degree ID"])
    }
  }
};

export default generator;
