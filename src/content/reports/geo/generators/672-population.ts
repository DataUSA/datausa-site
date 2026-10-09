// Converted from legacy canon_cms_generator #672 "Population" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 672,
  name: "Population",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_total_population_5&measures=Population&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year`,
  logic: (resp, {libs, formatters}) => {
    const data = resp.data.filter((d: any) => d["Population"] > 0);

    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastData = data.filter((d: any) => d.Year === lastYear)
    const prevData = data.filter((d: any) => d.Year === prevYear)


    const curr: any = lastData[0] ? lastData[0]["Population"] : false;
    const currYear: any = lastData[0] ? lastData[0]["Year"] : false;

    const retObj: Record<string, any> = {
      popCurr: curr,
      popYearCurr: currYear,
      popPrev: false
    };

    if (prevData.length > 1) {
      const prev = prevData[0]["Population"];
      const prevYear = prevData[0]["Year"];
  
      retObj.popPrev = prev;
      retObj.popGrowth = formatters.growth({curr, prev});
      retObj.popYearPrev = prevYear
  
    }

    const key: string = "popGrowth";
    const {growthPct, growthWord} = formatters;
    retObj.popSubtitle = retObj[key]
      ? `${growthPct(retObj[key])} 1-year ${growthWord(retObj[key])}`
      : "";

    return retObj;
  }
};

export default generator;
