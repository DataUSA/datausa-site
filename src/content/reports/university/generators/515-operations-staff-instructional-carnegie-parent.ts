// Converted from legacy canon_cms_generator #515 "[Operations] Staff (Instructional Carnegie Parent)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 515,
  name: "[Operations] Staff (Instructional Carnegie Parent)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Total+Salaries`,
  logic: (resp) => {
    const data = resp.data;
    //.filter((d: any) => d["Total Outlays Instructional Employees"]);
    //if (!data.length) return {staffInstructionalEmployees: false};

    data.sort((a: any, b: any) => b["Year"] - a["Year"]);

    return {
      staffInstructionalDataCP: data
      //staffInstructionalShare: 100 * dataCurrYear["Total Outlays Instructional Employees"] / dataCurrYear["Total Salaries"]
    }
  }
};

export default generator;
