// Converted from legacy canon_cms_generator #612 "Employees (PUMS) " (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 612,
  name: "Employees (PUMS) ",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id}&measures=Total+Population&Workforce+Status=true&drilldowns=Year`,
  logic: (resp, {libs}) => {
    if (!resp.data.length) return {};

    const data = resp.data;
    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastYearData = data.filter((d: any) => d.Year === lastYear)
    const prevYearData = data.filter((d: any) => d.Year === prevYear)


    return {
      empPumsCurr: lastYearData[0] ? lastYearData[0]["Total Population"] : 0,
      //empPumsCurrMoe: lastYearData[0]["Total Population MOE Appx"],
      empPumsCurrYear: lastYearData[0] ? lastYearData[0].Year : 0,
      empPumsPrev: prevYearData[0] ? prevYearData[0]["Total Population"] : 0,
      //empPumsPrevMoe: resp.data[1]["Total Population MOE Appx"],
      empPumsPrevYear: prevYearData[0] ? prevYearData[0].Year : 0
    };
  }
};

export default generator;
