// Converted from legacy canon_cms_generator #762 "[Financial Aid by Income Level] Visibility" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 762,
  name: "[Financial Aid by Income Level] Visibility",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Year&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Median+Grant+Or+Scholarship+Award`,
  logic: (resp) => {
    const data = resp.data.filter((d: any) => d["Median Grant Or Scholarship Award"] !== null && d["Median Grant Or Scholarship Award"] !== 0);

    const visibleFinancialAidSection = data.length > 0;

    return{
      visibleFinancialAidSection
    }
  }
};

export default generator;
