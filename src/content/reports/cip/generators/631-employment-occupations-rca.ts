// Converted from legacy canon_cms_generator #631 "[Employment] Occupations (RCA)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 631,
  name: "[Employment] Occupations (RCA)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=Detailed+Occupation&measure=Total+Population&time=Year&cuts=CIP2:${attrs.cip2};Workforce%20Status:true&filters=Record+Count.gte.5&top=3.Year.Total+Population+RCA.desc`,
  logic: (resp, {libs}) => {
    let occupationSpecializedTop3: any;
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const data = resp.data.filter((d: any) => d["Year"] === latestYear)

    const url = (d: any) => `<a href='/profile/soc/${d["Detailed Occupation ID"]}'>${d["Detailed Occupation"]}</a>`;
    occupationSpecializedTop3 = resp.data.slice(0, 3).map(url);

    return {
      occupationSpecializedTop3
    }
  }
};

export default generator;
