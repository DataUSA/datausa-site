// Converted from legacy canon_cms_generator #608 "[Education] RCA Majors" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 608,
  name: "[Education] RCA Majors",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=${attrs.hierarchy}&activity=CIP2&measure=Total+Population&time=Year&cuts=${attrs.hierarchy}:${attrs.id};Workforce%20Status:true&time_filter=Year.latest&complementary_drilldowns=Workforce%20Status&filters=Record+Count.gte.5`,
  logic: (resp, {libs, formatters}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const data_ = resp.data.filter((d: any) => d["Year"] === latestYear && d["CIP2 ID"] !== "")

    const url = (d: any) => `<a href='/profile/cip/${d["CIP2 ID"]}'>${d["CIP2"]}</a>`;

    const dataRCA = data_.sort((a: any, b: any) => b["Total Population RCA"] - a["Total Population RCA"]);
    const data = dataRCA.map(url);

    const list_: any = [];

    const name1 = data.length > 0 && data[0]
    const name2 = data.length > 1 && data[1]
    const name3 = data.length > 2 && data[2]

    const metric1 = formatters.abbreviate(dataRCA.length > 0 && dataRCA[0]["Total Population RCA"])
    const metric2 = formatters.abbreviate(dataRCA.length > 1 && dataRCA[1]["Total Population RCA"])
    const metric3 = formatters.abbreviate(dataRCA.length > 2 && dataRCA[2]["Total Population RCA"])


    if (name1) {
      list_.push(`${name1} (${metric1})`);
    }

    if (name2) {
      list_.push(`${name2} (${metric2})`);
    }

    if (name3) {
      list_.push(`${name3} (${metric3})`);
    }


    return {
      majorRCAList: formatters.list(list_),
      RCALatestYear: latestYear,
      major1RCAName: data.length > 0 && data[0]
    }

  }
};

export default generator;
