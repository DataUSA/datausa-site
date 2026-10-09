// Converted from legacy canon_cms_generator #253 "[Costs] Default Rates" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 253,
  name: "[Costs] Default Rates",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?OPEID=${attrs.opeid}&cube=ed_defaults&drilldowns=OPEID%2CYear&measures=Borrowers+In+Default%2CBorrowers+Entered+Repayment%2CDefault+Rate`,
  logic: (resp, {libs, variables}) => {
    /** Loan Data only works for Universities, not Carnegies or Carnegie Parents.
     * It's known behavior that the default rate shows up as N/A for the parent types.
     * Use resp.data's status as a rudimentary "isUniversity" detector */

    const {opeid} = variables;
    const data = resp.data;

    if(data.length > 0){

      const latestYear = libs.d3.max(data, (d: any) => d["Year"]);
      const data_ = data.filter((d: any) => d["Year"] === latestYear);
  
      return {
        defaultYearCurr: data_[0]["Year"],
        defaultRate: data_[0] && data_[0]["Default Rate"] > 0 ? data_[0]["Default Rate"] * 100 : false,
        defaultCount: data_[0]["Borrowers In Default"],
        defaultTotal: data_[0]["Borrowers Entered Repayment"],
      }
    }
      /* Don't return busted variables for Carnegies and Carnegie Parents, just let them be N/A */
      else {
        return {
          defaultYearCurr: false
        }
      }

  }
};

export default generator;
