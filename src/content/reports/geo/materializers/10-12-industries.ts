// Converted from legacy canon_cms_materializer #12 "Industries" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 12,
  name: "Industries",
  ordering: 10,
  allowed: "always",
  logic: (variables) => {
    const {
  
      commonIndustryListACS,
      commonIndustryListPUMS, 
      commonIndustrySplitACS,
      commonIndustrySplitPUMS,
  
      /*specialIndustryListACS,
      specialIndustryListPUMS,
      specialIndustrySplitACS,
      specialIndustrySplitPUMS,*/
  
      payingIndustryListACS,
      payingIndustryListPUMS,
      payingIndustrySplitACS,
      payingIndustrySplitPUMS,
      payIndustryYear,
      payIndustryACSyear,
  
      useAcs
    } = variables;

    return {
  
      commonIndustryList: useAcs ? commonIndustryListACS : commonIndustryListPUMS, //Checked with tesseract
      commonIndustrySplit: useAcs ? commonIndustrySplitACS : commonIndustrySplitPUMS, //Checked with tesseract
      commonIndustryJoin: useAcs ? !commonIndustrySplitACS : !commonIndustrySplitPUMS, //Checked with tesseract
  
      /*specialIndustryList: useAcs ? specialIndustryListACS : specialIndustryListPUMS,
      specialIndustrySplit: useAcs ? specialIndustrySplitACS : specialIndustrySplitPUMS,
      specialIndustryJoin: useAcs ? !specialIndustrySplitACS : !specialIndustrySplitPUMS,*/
  
      payingIndustryList: useAcs ? payingIndustryListACS : payingIndustryListPUMS,
      payingIndustrySplit: useAcs ? payingIndustrySplitACS : payingIndustrySplitPUMS,
      payingIndustryJoin: useAcs ? !payingIndustrySplitACS : !payingIndustrySplitPUMS,
      payingIndustryLabel: useAcs ? "median earnings" : "average salary",
      payingIndustryYear: useAcs ? payIndustryACSyear : payIndustryYear,
    }
  }
};

export default materializer;
