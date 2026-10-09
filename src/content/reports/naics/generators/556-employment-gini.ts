// Converted from legacy canon_cms_generator #556 "[Employment] GINI" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 556,
  name: "[Employment] GINI",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&include=Workforce+Status:true;${attrs.hierarchy}:${attrs.id}&locale=en&measures=Record+Count%2CTotal+Population%2CAverage+Wage&filters=Record+Count.gte.5&time=Year.latest.2`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const currData = resp.data.filter((d: any) => d["Year"] === latestYear);
    const prevData = resp.data.filter((d: any) => d["Year"] === latestYear - 1);

    const config: Record<string, any> = {
      bucket: "Wage Bin", 
      value: "Average Wage", 
      weight: "Total Population"
    };

    const giniCurrYear = latestYear
    const giniPrevYear = latestYear - 1
    //const giniCurrYear = max(resp.data, (d: any) => d["ID Year"]);
    //const giniPrevYear = giniCurrYear*1 - 1

    //const currData = data.filter((d: any) => d["ID Year"]*1 === giniCurrYear*1);
    //const prevData = data.filter((d: any) => d["ID Year"]*1 === giniPrevYear*1);

    const giniCurr = formatters.gini({...config, data: currData});
    const giniPrev = formatters.gini({...config, data: prevData});
    const giniGrowth = formatters.growth({curr: giniCurr, prev: giniPrev});


    return {
      giniCurr, 
      giniCurrYear, 
      giniPrev, 
      giniPrevYear, 
      giniGrowth, 
      giniDirection: giniGrowth * -1
    };


  }
};

export default generator;
