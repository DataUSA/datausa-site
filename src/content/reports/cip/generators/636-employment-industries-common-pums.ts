// Converted from legacy canon_cms_generator #636 "[Employment] Industries (Common PUMS)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 636,
  name: "[Employment] Industries (Common PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Industry+Group&include=Workforce+Status:true;CIP2:${attrs.cip2}&locale=en&measures=Record+Count,Total+Population,Average+Wage&time=Year.latest&sort=Total+Population.desc&filter=Record+Count.gte.5&limit=11`,
  logic: (resp, {formatters}) => {
    const {commas} = formatters;

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;

    const data_ = resp.data.filter((d: any) => d["Industry Group ID"] !== "")

    const ids = data_.map((d: any) => d["Industry Group ID"]);
    const names = data_.map(url);
    const namesTop3 = names.slice(0, 3);
    const text = data_.slice(0, 3)
      .map((d: any) => `${url(d)} (${commas(d["Total Population"])})`);

    return {
      commonIndustryIDs: ids,
      commonIndustryNames: names,
      commonIndustryNamesTop3: namesTop3,
      commonIndustryNameTop1: names[0],
      commonIndustryNameTop2: names[1],
      commonIndustryList: text,
      commonIndSplit: data_.length === 11,
      commonIndJoin: data_.length !== 11,
      commonIndPUMSnames: data_.slice(0, 3).map(url),
      industryTopEmployment: data_.length ? url(data_[0]) : false
    }
  }
};

export default generator;
