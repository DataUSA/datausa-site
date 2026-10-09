// Converted from legacy canon_cms_generator #470 "[Payroll] By Industry" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 470,
  name: "[Payroll] By Industry",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,Industry&include=${attrs.hierarchy}:${attrs.id};Industry:11%2C21%2C22%2C23%2C31-33%2C42%2C44-45%2C48-49%2C51%2C52%2C53%2C54%2C55%2C56%2C61%2C62%2C71%2C72%2C81%2C92&locale=en&measures=Annual+Payroll&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const {dollar} = formatters;
    const data = resp.data;

    if(data.length == 0) {
      return {
        payrollVis: false,
        lastYearPayroll: false,
        payrollValue1: false,
        payrollIndustry1: false,
        payrollValue2: false,
        payrollIndustry2: false,
        payrollValue3: false,
        payrollIndustry3: false,
      }
    }

    const {commas} = formatters;

    const lastYearPayroll: any = data[0] ? data[0]["Year"] : false

    data.sort((a: any, b: any) => b["Annual Payroll"] > a["Annual Payroll"] ? 1 : -1);

    const payrollValue1: any = data[0] ? data[0]["Annual Payroll"] : false
    const payrollIndustry1: any = data[0] ? data[0]["Industry"] : false

    const payrollValue2: any = data[1] ? data[1]["Annual Payroll"] : false
    const payrollIndustry2: any = data[1] ? data[1]["Industry"] : false

    const payrollValue3: any = data[2] ? data[2]["Annual Payroll"] : false
    const payrollIndustry3: any = data[2] ? data[2]["Industry"] : false

    return {
      lastYearPayroll: lastYearPayroll,
      payrollValue1: payrollValue1 ? dollar(payrollValue1) : false,
      payrollIndustry1: payrollIndustry1,
      payrollValue2: payrollValue2 ?  dollar(payrollValue2) : false,
      payrollIndustry2: payrollIndustry2,
      payrollValue3: payrollValue3 ? dollar(payrollValue3) : false,
      payrollIndustry3: payrollIndustry3,
      payrollVis: true
    };
  }
};

export default generator;
