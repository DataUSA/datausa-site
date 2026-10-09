// Converted from legacy canon_cms_materializer #13 "Occupations" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 13,
  name: "Occupations",
  ordering: 11,
  allowed: "always",
  logic: (variables) => {
    const {
  
      commonOccupationListACS,
      commonOccupationListPUMS, 
      commonOccupationSplitACS,
      commonOccupationSplitPUMS,
  
      specialOccupationListACS,
      specialOccupationListPUMS,
      specialOccupationSplitACS,
      specialOccupationSplitPUMS,
  
      payingOccupationListACS,
      payingOccupationListPUMS,
      payingOccupationSplitACS,
      payingOccupationSplitPUMS,
  
      useAcs
    } = variables;

    return {
  
      commonOccupationList: useAcs ? commonOccupationListACS : commonOccupationListPUMS,
      commonOccupationSplit: useAcs ? commonOccupationSplitACS : commonOccupationSplitPUMS,
      commonOccupationJoin: useAcs ? !commonOccupationSplitACS : !commonOccupationSplitPUMS,
  
      specialOccupationList: useAcs ? specialOccupationListACS : specialOccupationListPUMS,
      specialOccupationSplit: useAcs ? specialOccupationSplitACS : specialOccupationSplitPUMS,
      specialOccupationJoin: useAcs ? !specialOccupationSplitACS : !specialOccupationSplitPUMS,
  
      payingOccupationList: useAcs ? payingOccupationListACS : payingOccupationListPUMS,
      payingOccupationSplit: useAcs ? payingOccupationSplitACS : payingOccupationSplitPUMS,
      payingOccupationJoin: useAcs ? !payingOccupationSplitACS : !payingOccupationSplitPUMS,
      payingOccupationLabel: useAcs ? "median earnings" : "average salary"
    }
  }
};

export default materializer;
