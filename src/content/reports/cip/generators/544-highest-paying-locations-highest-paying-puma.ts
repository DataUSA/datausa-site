// Converted from legacy canon_cms_generator #544 "[Highest Paying Locations] Highest Paying PUMA" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 544,
  name: "[Highest Paying Locations] Highest Paying PUMA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,PUMA&include=CIP2:${attrs.cip2};Workforce+Status:true&locale=en&measures=Record+Count,Average+Wage&time=Year.latest&filters=Record+Count.gte.5&top=3.Year.Average+Wage.desc`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;

    const data = resp.data.sort((a: any, b: any) => b["Average Wage"] - a["Average Wage"])

    const url = (d: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d["PUMA"]}</a>`;

    return {
      locationHighestPayingPUMA1: data[0] ? url(data[0]) : false,
      locationHighestPayingPUMA1AvgWage: data[0] ? `$${formatters.commas(data[0]["Average Wage"])}` : false,
      locationHighestPayingPUMA2: data[1] ? url(data[1]) : false,
      locationHighestPayingPUMA2AvgWage: data[0] ? `$${formatters.commas(data[1]["Average Wage"])}` : false,
      locationHighestPayingPUMA3: data[2] ? url(data[2]) : false,
      locationHighestPayingPUMA3AvgWage: data[0] ? `$${formatters.commas(data[2]["Average Wage"])}` : false,

    }
  }
};

export default generator;
