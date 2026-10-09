// Converted from legacy canon_cms_generator #770 "[Operations] Helper Salary Expenditure" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 770,
  name: "[Operations] Helper Salary Expenditure",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year&include=University:${attrs.id}&locale=en&measures=Median+Total+Expenses,Median+Total+Salaries`,
  logic: (resp) => {
    const data = resp.data;

    const lengthSalaryExp = data.length;

    return{
      lengthSalaryExp
    }
  }
};

export default generator;
