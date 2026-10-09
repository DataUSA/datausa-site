// Converted from legacy canon_cms_generator #673 "Median Age" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 673,
  name: "Median Age",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygs_median_age_total_5&measures=Median+Age&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data;

    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastData = data.filter((d: any) => d.Year === lastYear)
    const prevData = data.filter((d: any) => d.Year === prevYear)

    const curr: any = lastData[0] ? lastData[0]["Median Age"] : false
    const currYear: any = lastData[0] ? lastData[0]["Year"] : false

    const retObj: Record<string, any> = {
      ageCurr: curr ? formatters.abbreviate(curr) : false,
      ageCurrYear: currYear,
      ageGrowth: false
    };

    if (prevData.length > 0) {
      const prev = prevData[0]["Median Age"];
      const prevYear = prevData[0]["Year"];
  
      retObj.agePrev = prev;
      retObj.agePrevYear = prevYear;
      retObj.ageGrowth = formatters.growth({curr, prev});
    }

    return retObj;
  }
};

export default generator;
