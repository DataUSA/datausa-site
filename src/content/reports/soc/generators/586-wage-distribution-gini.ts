// Converted from legacy canon_cms_generator #586 "[Wage Distribution] GINI" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 586,
  name: "[Wage Distribution] GINI",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&include=${attrs.hierarchy}:${attrs.id};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population%2CAverage+Wage&time=Year.latest.2`,
  logic: (resp, {libs, formatters}) => {
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);

    const data = resp.data.sort((a: any, b: any) => a["Wage Bin ID"] - b["Wage Bin ID"])

    const config: Record<string, any> = {
      bucket: "Wage Bin", 
      value: "Average Wage", 
      weight: "Total Population"
    };

    //
    //const years = data.slice(0, 2).map((d: any) => parseInt(d.Year)).sort().map(String);
    const giniCurrYear = latestYear;
    const giniPrevYear = latestYear - 1;
    //

    const currData = data.filter((d: any) => d.Year === giniCurrYear);
    const prevData = data.filter((d: any) => d.Year === giniPrevYear);

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
