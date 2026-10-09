// Converted from legacy canon_cms_generator #614 "[Employment] RCA by State" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 614,
  name: "[Employment] RCA by State",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=State&activity=${attrs.hierarchy}&measure=Total+Population&time=Year&cuts=${attrs.hierarchy}:${attrs.id};Workforce%20Status:true&top=3.Year.Total+Population+RCA.desc&time_filter=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    // /api/data?<hierarchy>=<id>&drilldowns=State&measure=ygopop RCA,Record Count&Record Count>=5&order=ygopop RCA&sort=desc&Workforce Status=true&Year=<pumsLatestYear>&limit=3

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])

    const data = resp.data.filter((d: any) => d["Year"] === latestYear);
    const url = (d: any) => `<a href='/profile/geo/${d["State ID"]}'>${d["State"]}</a>`;
    const dataFiltered = data.map(url);
    const list_: any = [];

    const name1 = dataFiltered.length > 0 && dataFiltered[0]
    const name2 = dataFiltered.length > 1 && dataFiltered[1]
    const name3 = dataFiltered.length > 2 && dataFiltered[2]

    const metric1 = formatters.abbreviate(data.length > 0 && data[0]["Total Population RCA"])
    const metric2 = formatters.abbreviate(data.length > 1 && data[1]["Total Population RCA"])
    const metric3 = formatters.abbreviate(data.length > 2 && data[2]["Total Population RCA"])


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
      topRCAList_statesEBL: formatters.list(list_),
      topRcaLastYear_statesEBL: latestYear,
    }




  }
};

export default generator;
