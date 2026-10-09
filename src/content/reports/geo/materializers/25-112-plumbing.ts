// Converted from legacy canon_cms_materializer #112 "Plumbing" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 112,
  name: "Plumbing",
  ordering: 25,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy,
      plumbingAll, plumbingAllMeasure, plumbingAllYear, plumbingAll1Name, plumbingAll1Value, plumbingAll1Sub, 
      plumbingAll2Name, plumbingAll2Value, plumbingAll2Sub, plumbingAll3Name, plumbingAll3Value, plumbingAll3Sub,
      plumbingAllVisible1, plumbingAllVisibleText1, plumbingAllVisibleMore,

      plumbingPlaces, plumbingPlacesMeasure, plumbingPlacesYear, plumbingPlaces1Name, plumbingPlaces1Value, plumbingPlaces1Sub, 
      plumbingPlaces2Name, plumbingPlaces2Value, plumbingPlaces2Sub, plumbingPlaces3Name, plumbingPlaces3Value, plumbingPlaces3Sub,
      plumbingPlacesVisible1, plumbingPlacesVisibleText1, plumbingPlacesVisibleMore
  
    } = variables;

    return{
      plumbingVisible1: hierarchy === "Place" ? plumbingPlacesVisible1 : plumbingAllVisible1,
      plumbingVisibleText1: hierarchy === "Place" ? plumbingPlacesVisibleText1 : plumbingAllVisibleText1,
      plumbingVisibleMore: hierarchy === "Place" ? plumbingPlacesVisibleMore : plumbingAllVisibleMore,
      plumbing: hierarchy === "Place" ? plumbingPlaces : plumbingAll,
      plumbingMeasure: hierarchy === "Place" ? plumbingPlacesMeasure : plumbingAllMeasure,
      plumbingYear: hierarchy === "Place" ? plumbingPlacesYear : plumbingAllYear,
      plumbing1Name: hierarchy === "Place" ? plumbingPlaces1Name : plumbingAll1Name,
      plumbing1Value: hierarchy === "Place" ? plumbingPlaces1Value : plumbingAll1Value,
      plumbing1Sub: hierarchy === "Place" ? plumbingPlaces1Sub : plumbingAll1Sub,
      plumbing2Name: hierarchy === "Place" ? plumbingPlaces2Name : plumbingAll2Name,
      plumbing2Value: hierarchy === "Place" ? plumbingPlaces2Value : plumbingAll2Value,
      plumbing2Sub: hierarchy === "Place" ? plumbingPlaces2Sub : plumbingAll2Sub,
      plumbing3Name: hierarchy === "Place" ? plumbingPlaces3Name : plumbingAll3Name,
      plumbing3Value: hierarchy === "Place" ? plumbingPlaces3Value : plumbingAll3Value,
      plumbing3Sub: hierarchy === "Place" ? plumbingPlaces3Sub : plumbingAll3Sub
    }
  }
};

export default materializer;
