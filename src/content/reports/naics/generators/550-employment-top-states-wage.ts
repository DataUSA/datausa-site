// Converted from legacy canon_cms_generator #550 "[Employment] Top States wage" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 550,
  name: "[Employment] Top States wage",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=State,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Average+Wage&time=Year.latest&top=3.Year.Average+Wage.desc`,
  logic: (resp, {formatters}) => {
    const lastData = resp.data;
    const lastYearEmploymentLocation = lastData[0].Year

    lastData.sort((a: any, b: any) => b["Average Wage"] > a["Average Wage"] ? 1 : -1);
    const top3_wage_states = lastData.slice(0,3).map((d: any, i: any) => `<a href='/profile/geo/${d["State ID"]}'>${d.State}</a> (${formatters.dollar(d["Average Wage"])})`)
    const top1_wage_states = lastData.slice(0,1).map((d: any, i: any) => `<a href='/profile/geo/${d["State ID"]}'>${d.State}</a> (${formatters.dollar(d["Average Wage"])})`)


    return {
      top1_wage_states,
      top3_wage_states
    }
  }
};

export default generator;
