// Converted from legacy canon_cms_materializer #11 "Selector Grammar" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 11,
  name: "Selector Grammar",
  ordering: 8,
  allowed: "always",
  logic: (variables) => {
    const {
      hierarchy,
      child, 
      childPlural, 
      countyDataDepthLower, 
      countyDataDepthLowerPlural,
      nameLower,
      subtitleCounty,
      subtitleState,
      subtitleTract,
      subtitlePUMA,
      subtitleMSA,
      subtitlePlace
    } = variables;

    const subtitle: Record<string, any> = {
      state: subtitleState,
      county: subtitleCounty,
      tract: subtitleTract,
      PUMA: subtitlePUMA,
      MSA: subtitleMSA,
      place: subtitlePlace
    };

    const highest: string = "highest";
    const prevalence: string = "highest prevalence of";

    return {
      exerciseLevel: countyDataDepthLower,
      exerciseLevelPlural: countyDataDepthLowerPlural,
      exerciseSub: subtitleCounty,
      exerciseGrammar: highest,
      exerciseParent: countyDataDepthLower === "county" ? "the state" : "the nation",
      foodLevel: countyDataDepthLower,
      foodLevelPlural: countyDataDepthLowerPlural,
      foodSub: subtitleCounty,
      foodGrammar: prevalence,
      foodParent: countyDataDepthLower === "county" ? "the state" : "the nation",
      homelessLevel: "state",
      homelessLevelPlural: "states",
      homelessSub: subtitleState,
      homelessGrammar: highest,
      homelessParent: "the nation",
      plumbingLevel: child,
      plumbingLevelPlural: childPlural,
      plumbingSub: hierarchy === "Place" ? "Data available at the county level." : subtitle[child],
      plumbingGrammar: highest,
      plumbingParent: nameLower,
      kitchenLevel: child,
      kitchenLevelPlural: childPlural,
      kitchenSub: hierarchy === "Place" ? "Data available at the county level." : subtitle[child],
      kitchenGrammar: highest,
      kitchenParent: nameLower,
      internetLevel: child,
      internetLevelPlural: childPlural,
      internetSub: hierarchy === "Place" ? "Data available at the county level." : subtitle[child],
      internetGrammar: highest,
      internetParent: nameLower,
    }
  }
};

export default materializer;
