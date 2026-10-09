// Converted from legacy canon_cms_generator #759 "[Costs] Financial Aid (Median Grant)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 759,
  name: "[Costs] Financial Aid (Median Grant)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Grant+Or+Scholarship+Award`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Median Grant Or Scholarship Award"] !== null)

    const financialAidVis = data.length > 0;
  
    return{
      financialAidVis
    }
  }
};

export default generator;
