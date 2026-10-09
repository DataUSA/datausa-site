// Converted from legacy canon_cms_generator #653 "[About] RCA (Occupations)" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 653,
  name: "[About] RCA (Occupations)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=PUMA&activity=${attrs.hierarchy}&measure=Total+Population&time=Year&cuts=${attrs.hierarchy}:${attrs.id};Workforce%20Status:true&complementary_drilldowns=Workforce%20Status&filters=Record+Count.gte.5&top=3.Year.Total+Population+RCA.desc&time_filter=Year.latest`,
  logic: (resp, {libs}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const data = resp.data.filter((d: any) => d["Year"] === latestYear && d["PUMA"] !== "#null")

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;

    const data_ = data.slice(0,3).map(url);


    return {
      topConcentration: data_,
      puma1Name: data_.length > 0 && data_[0]
    }

  }
};

export default generator;
