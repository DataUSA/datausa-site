// Converted from legacy canon_cms_generator #499 "Carnegie Parents (Finances)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 499,
  name: "Carnegie Parents (Finances)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Endowment+Value%2CMedian+Investment+Income%2CMedian+Total+Expenses&time=Year.latest`,
  logic: (resp) => {
    ///api/data?measures=Median%20Endowment%20Value,Median%20Investment%20Income,Median%20Total%20Expenses&Year=latest&drilldowns=Carnegie%20Parent

    return {
      carnegieParentsFinanceList: resp.data
    }
  }
};

export default generator;
