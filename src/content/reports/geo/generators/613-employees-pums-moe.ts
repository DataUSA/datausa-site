// Converted from legacy canon_cms_generator #613 "Employees (PUMS) - MOE" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 613,
  name: "Employees (PUMS) - MOE",
  allowed: "always",
  api: attrs => `${attrs.tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year&measures=Total+Population+MOE+Appx&locale=en&parents=false&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true>`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {};

    const data = resp.data;
    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastYearData = data.filter((d: any) => d.Year === lastYear)
    const prevYearData = data.filter((d: any) => d.Year === prevYear)


    return {
      empPumsCurrMoe: lastYearData[0]["Total Population MOE Appx"],
      empPumsPrevMoe: resp.data[1]["Total Population MOE Appx"],
    };
  }
};

export default generator;
