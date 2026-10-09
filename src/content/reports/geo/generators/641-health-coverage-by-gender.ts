// Converted from legacy canon_cms_generator #641 "[Health] Coverage by gender" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 641,
  name: "[Health] Coverage by gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_yghsa_health_coverage_status_by_gender_by_age_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Gender&measures=Health Insurance by Gender and Age&time=Year.latest`,
  logic: (resp, {libs}) => {
    const data = resp.data;

    const lastYearCoverage_genderOption: any = data[0] ? data[0]["Year"] : undefined

    const total = libs.d3.sum(data, (d: any) => d["Health Insurance by Gender and Age"]);
    const menCoverage = (data.filter((d: any) => d["Gender ID"] === 0)[0]["Health Insurance by Gender and Age"]/total) * 100
    const womenCoverage = (data.filter((d: any) => d["Gender ID"] === 1)[0]["Health Insurance by Gender and Age"]/total) * 100

    return {
      lastYearCoverage_genderOption,
      menCoverage,
      womenCoverage
    };
  }
};

export default generator;
