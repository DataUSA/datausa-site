// Converted from legacy canon_cms_generator #506 "Cost University Living Expenses" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 506,
  name: "Cost University Living Expenses",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,${attrs.hierarchy}&measures=Total Room And Board,Median Other Student Expenses&include=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {variables}) => {
    ///api/data?University=<id>,<id>:similar&measures=Books And Supplies,Total Room And Board,Out Of State Tuition,Median Other Student Expenses
    const {hierarchy} = variables;

    const data = resp.data.reduce((obj: any, d: any) => {
      if (!obj[`${d["Year"]}_${d[`${hierarchy} ID`]}`]) obj[`${d["Year"]}_${d[`${hierarchy} ID`]}`] = d["Total Room And Board"] + d["Median Other Student Expenses"];
      return obj;
    }, {})
    return {
      costUniversityLivingExpenses: data
    }

  }
};

export default generator;
