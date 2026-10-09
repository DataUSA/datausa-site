// Converted from legacy canon_cms_generator #552 "[Employment] Top PUMAS Specialization (RCA)" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 552,
  name: "[Employment] Top PUMAS Specialization (RCA)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=PUMA&activity=${attrs.hierarchy}&measure=Total+Population&time=Year&cuts=${attrs.hierarchy}:${attrs.id};Workforce%20Status:true`,
  logic: (resp, {libs}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"])
    const lastData = resp.data.filter((d: any) => d["Year"] === latestYear);

    lastData.sort((a: any, b: any) => {return b["Total Population RCA"] > a["Total Population RCA"] ? 1 : -1})

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;

    let top3_specialization_pumas: any = [];

    lastData.slice(0,3).map((item: any) =>{
      top3_specialization_pumas.push(url(item));
    });

    return {
      top3_specialization_pumas: top3_specialization_pumas,
      topLocationsYear: latestYear
    }
  }
};

export default generator;
