// Converted from legacy canon_cms_generator #548 "[Employment] Top PUMAS wages" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 548,
  name: "[Employment] Top PUMAS wages",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=PUMA,Year&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Average+Wage&time=Year.latest&top=3.Year.Average+Wage.desc`,
  logic: (resp, {libs, formatters}) => {
    //const {max} = libs.d3;
    //const latestYear = max(resp.data, (d: any) => d["ID Year"]);
    //const currData = resp.data.filter((d: any) => d["ID Year"] === latestYear);
    const currData = resp.data;

    const top3_wage_pumas = currData.slice(0,3).map((d: any, i: any) => `<a href='/profile/geo/${d["PUMA ID"]}'>${d.PUMA}</a> (${formatters.salary(d["Average Wage"])})`)


    return {
      top3_wage_pumas
    }
  }
};

export default generator;
