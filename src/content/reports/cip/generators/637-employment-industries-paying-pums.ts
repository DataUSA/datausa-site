// Converted from legacy canon_cms_generator #637 "[Employment] Industries (Paying PUMS)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 637,
  name: "[Employment] Industries (Paying PUMS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Industry+Group&include=Workforce+Status:true;CIP2:${attrs.cip2}&locale=en&measures=Record+Count,Average+Wage&time=Year.latest&top=10.Year.Average+Wage.desc&filter=Record+Count.gte.5&limit=11`,
  logic: (resp, {formatters}) => {
    const {salary} = formatters;

    const data = resp.data.filter((d: any) => d["Industry Group ID"] !== "")

    const url = (d: any) => `<a href='/profile/naics/${d["Industry Group ID"]}'>${d["Industry Group"]}</a>`;

    const ids = data.map((d: any) => d["Industry Group ID"]);
    const names = data.map(url);
    const namesTop3 = names.slice(0, 3);
    const text = data.slice(0, 3)
      .map((d: any) => `${url(d)} (${salary(d["Average Wage"])})`);

    return {
      payingIndustryIDs: ids,
      payingIndustryName: names,
      payingIndustryNamesTop3: namesTop3,
      payingIndustryList: text,
      payingIndustryTop: names[0],
      payingIndSplit: data.length === 11,
      payingIndJoin: data.length !== 11,
      payingIndPUMSnames: data.slice(0, 3).map(url)
    }
  }
};

export default generator;
