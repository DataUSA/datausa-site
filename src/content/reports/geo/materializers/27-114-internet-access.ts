// Converted from legacy canon_cms_materializer #114 "Internet Access" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 114,
  name: "Internet Access",
  ordering: 27,
  allowed: "always",
  logic: (variables) => {
    const {hierarchy,
      internetAll, internetAllMeasure, internetAllYear, internetAll1Name, internetAll1Value, internetAll1Sub, 
      internetAll2Name, internetAll2Value, internetAll2Sub, internetAll3Name, internetAll3Value, internetAll3Sub,
      internetAllVisible1, internetAllVisibleText1, internetAllVisibleMore,

      internetPlaces, internetPlacesMeasure, internetPlacesYear, internetPlaces1Name, internetPlaces1Value, internetPlaces1Sub, 
      internetPlaces2Name, internetPlaces2Value, internetPlaces2Sub, internetPlaces3Name, internetPlaces3Value, internetPlaces3Sub,
      internetPlacesVisible1, internetPlacesVisibleText1, internetPlacesVisibleMore
  
    } = variables;

    return{
      internetVisible1: hierarchy === "Place" ? internetPlacesVisible1 : internetAllVisible1,
      internetVisibleText1: hierarchy === "Place" ? internetPlacesVisibleText1 : internetAllVisibleText1,
      internetVisibleMore: hierarchy === "Place" ? internetPlacesVisibleMore : internetAllVisibleMore,
      internet: hierarchy === "Place" ? internetPlaces : internetAll,
      internetMeasure: hierarchy === "Place" ? internetPlacesMeasure : internetAllMeasure,
      internetYear: hierarchy === "Place" ? internetPlacesYear : internetAllYear,
      internet1Name: hierarchy === "Place" ? internetPlaces1Name : internetAll1Name,
      internet1Value: hierarchy === "Place" ? internetPlaces1Value : internetAll1Value,
      internet1Sub: hierarchy === "Place" ? internetPlaces1Sub : internetAll1Sub,
      internet2Name: hierarchy === "Place" ? internetPlaces2Name : internetAll2Name,
      internet2Value: hierarchy === "Place" ? internetPlaces2Value : internetAll2Value,
      internet2Sub: hierarchy === "Place" ? internetPlaces2Sub : internetAll2Sub,
      internet3Name: hierarchy === "Place" ? internetPlaces3Name : internetAll3Name,
      internet3Value: hierarchy === "Place" ? internetPlaces3Value : internetAll3Value,
      internet3Sub: hierarchy === "Place" ? internetPlaces3Sub : internetAll3Sub
    }
  }
};

export default materializer;
