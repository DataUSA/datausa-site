// Converted from legacy canon_cms_generator #639 "[Employment] PUMAs RCA" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 639,
  name: "[Employment] PUMAs RCA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=PUMA&measure=Total+Population&time=Year&cuts=CIP2:${attrs.cip2};Workforce%20Status:true&filters=Record+Count.gte.5&top=3.Year.Total+Population+RCA.desc`,
  logic: (resp, {libs, formatters}) => {
    const {abbreviate} = formatters

    const latestYear = libs.d3.max(resp.data, (d: any) => d.Year)
    const data_ = resp.data.filter((d: any) => d.Year === latestYear && d["PUMA ID"] != "#null")

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;

    let filteredData = data_.slice(0,3)

    const data = filteredData.map(url);

    return {
      location1NameRCA: data.length > 0 && data[0],
      location1NameRCAScore: data.length > 0 ? abbreviate(data_[0]['Total Population RCA']) : false,
      location2NameRCA: data.length > 1 && data[1],
      location2NameRCAScore: data.length > 1 ? abbreviate(data_[1]['Total Population RCA']) : false,
      location3NameRCA: data.length > 2 && data[2],
      location3NameRCAScore: data.length > 2 ? abbreviate(data_[2]['Total Population RCA']) : false,
    }
  }
};

export default generator;
