// Converted from legacy canon_cms_materializer #113 "Kitchen" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 113,
  name: "Kitchen",
  ordering: 26,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy,
      kitchenAll, kitchenAllMeasure, kitchenAllYear, kitchenAll1Name, kitchenAll1Value, kitchenAll1Sub, 
      kitchenAll2Name, kitchenAll2Value, kitchenAll2Sub, kitchenAll3Name, kitchenAll3Value, kitchenAll3Sub,
      kitchenAllVisible1, kitchenAllVisibleText1, kitchenAllVisibleMore,

      kitchenPlaces, kitchenPlacesMeasure, kitchenPlacesYear, kitchenPlaces1Name, kitchenPlaces1Value, kitchenPlaces1Sub, 
      kitchenPlaces2Name, kitchenPlaces2Value, kitchenPlaces2Sub, kitchenPlaces3Name, kitchenPlaces3Value, kitchenPlaces3Sub,
      kitchenPlacesVisible1, kitchenPlacesVisibleText1, kitchenPlacesVisibleMore

    } = variables;

    return{
      kitchenVisible1: hierarchy === "Place" ? kitchenPlacesVisible1 : kitchenAllVisible1,
      kitchenVisibleText1: hierarchy === "Place" ? kitchenPlacesVisibleText1 : kitchenAllVisibleText1,
      kitchenVisibleMore: hierarchy === "Place" ? kitchenPlacesVisibleMore : kitchenAllVisibleMore,
      kitchen: hierarchy === "Place" ? kitchenPlaces : kitchenAll,
      kitchenMeasure: hierarchy === "Place" ? kitchenPlacesMeasure : kitchenAllMeasure,
      kitchenYear: hierarchy === "Place" ? kitchenPlacesYear : kitchenAllYear,
      kitchen1Name: hierarchy === "Place" ? kitchenPlaces1Name : kitchenAll1Name,
      kitchen1Value: hierarchy === "Place" ? kitchenPlaces1Value : kitchenAll1Value,
      kitchen1Sub: hierarchy === "Place" ? kitchenPlaces1Sub : kitchenAll1Sub,
      kitchen2Name: hierarchy === "Place" ? kitchenPlaces2Name : kitchenAll2Name,
      kitchen2Value: hierarchy === "Place" ? kitchenPlaces2Value : kitchenAll2Value,
      kitchen2Sub: hierarchy === "Place" ? kitchenPlaces2Sub : kitchenAll2Sub,
      kitchen3Name: hierarchy === "Place" ? kitchenPlaces3Name : kitchenAll3Name,
      kitchen3Value: hierarchy === "Place" ? kitchenPlaces3Value : kitchenAll3Value,
      kitchen3Sub: hierarchy === "Place" ? kitchenPlaces3Sub : kitchenAll3Sub
    }
  }
};

export default materializer;
