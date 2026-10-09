// Converted from legacy canon_cms_generator #611 "Employees (ACS)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 611,
  name: "Employees (ACS)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygso_gender_by_occupation_c_5&include=${attrs.hierarchy}:${attrs.id}&measures=Workforce+by+Occupation+and+Gender,Workforce+by+Occupation+and+Gender+Moe&drilldowns=Year`,
  logic: (resp, {libs}) => {
    const measure: string = "Workforce by Occupation and Gender";
    const data = resp.data;
    const lastYear = libs.d3.max(data, (d: any) => d.Year)
    const prevYear = lastYear - 1

    const lastYearData = data.filter((d: any) => d.Year === lastYear)
    const prevYearData = data.filter((d: any) => d.Year === prevYear)

    const retObj: Record<string, any> = {
      empAcsCurr: lastYearData[0] ? lastYearData[0][measure] : 0,
      empAcsCurrMoe: lastYearData[0] ? lastYearData[0][`${measure} Moe`] : 0,
      empAcsCurrYear: lastYearData[0] ? lastYearData[0].Year : 0
    };

    if (resp.data.length > 1) {
      retObj.empAcsPrev = prevYearData[0] ? prevYearData[0][measure] : 0;
      retObj.empAcsPrevMoe = prevYearData[0] ? prevYearData[0][`${measure} Moe`] : 0;
      retObj.empAcsPrevYear = prevYearData[0] ? prevYearData[0].Year : 0;
    }

    return retObj;
  }
};

export default generator;
