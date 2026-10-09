// Converted from legacy canon_cms_generator #660 "Property Value" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 660,
  name: "Property Value",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yg_housing_median_value_5&include=${attrs.hierarchy}:${attrs.id}&measures=Property+Value,Property+Value+Moe&drilldowns=Year`,
  logic: (resp, {libs, formatters}) => {
    const measure: string = "Property Value";
    const data = resp.data.filter((d: any) => d[measure]);

    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastData = data.filter((d: any) => d.Year === lastYear)
    const prevData = data.filter((d: any) => d.Year === prevYear)

    const curr: any = lastData[0] ? lastData[0][measure] : false;
    const currMoe: any = lastData[0] ? lastData[0][`${measure} Moe`] : false;

    const retObj: Record<string, any> = {
      propertyCurr: curr,
      propertyCurrMoe: currMoe ? currMoe : false,
      propertyCurrYear: lastData[0] ? lastData[0].Year : false,
      propertyGrowth: false
    };

    if (prevData.length > 0) {
      const prev = prevData[0][measure];
      const prevMoe = prevData[0][`${measure} Moe`];
      retObj.propertyPrev = prev;
      retObj.propertyPrevMoe = prevMoe;
      retObj.propertyPrevYear = prevData[0].Year;
      retObj.propertyGrowth = formatters.growth({curr, prev});
    }

    const key: string = "propertyGrowth";
    const {growthPct, growthWord} = formatters;
    retObj.propertySubtitle = retObj[key]
      ? `${growthPct(retObj[key])} 1-year ${growthWord(retObj[key])}`
      : "";

    return retObj;

  }
};

export default generator;
