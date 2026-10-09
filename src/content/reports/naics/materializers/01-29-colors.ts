// Converted from legacy canon_cms_materializer #29 "Colors" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 29,
  name: "Colors",
  ordering: 1,
  allowed: "always",
  logic: (variables) => {
    return !variables.colorCommodityL0 ? {
      colorOccPUMS: {
        "110000-290000": "#ff8166",
        "310000-390000": "#ffb563",
        "410000-430000": "#1a9b9a",
        "450000-490000": "#336a81",
        "510000-530000": "#49418e",
        "550000": "#2f1fc1"
      },
      colorLeast: "#58879A",
      colorMost: "#1A3E61",
      colorGrey: "#C6C7CA",
      colorHighlight: "#ef6145",
      colorGender: {
        "Male": "#1A3E61",
        "Men": "#1A3E61",
        "Female": "#CA3434",
        "Women": "#CA3434"
      },
      colorRaceACS: {
        "0": "#004374",
        "1": "#ff8166",
        "2": "#ffb563",
        "3": "#c19a1f",
        "4": "#1a9b9a",
        "5": "#bf168e",
        "6": "#2f1fc1",
        "7": "#336a81",
        "8": "#82a8e7",
        "9": "#49418e"
      },
      colorRacePUMS: {
        "1": "#ff8166",
        "2": "#ffb563",
        "3": "#c19a1f",
        "4": "#f33535",
        "5": "#82a8e7",
        "6": "#1a9b9a",
        "7": "#bf168e",
        "8": "#2f1fc1",
        "9": "#336a81"
      },
      colorCommodityL0: {
        "PROF": "#175853",
        "FIRE": "#00c5ad",
        "31G": "#917a36",
        "81": "#30426e",
        "42": "#ead15b",
        "6": "#631827",
        "7": "#d20091",
        // "PROF": "#fff37d",
        "VA": "#ff856d",
        "FINALUSES": "#85c4ee",
        "51": "#d13a00",
        "48TW": "#19304e",
        "22": "#9fe3a9",
        "23": "#1f9ed1",
        "11": "#4b3e93",
        "44RT": "#5065e5",
        "21": "#c89800"
      }
    } : {colorMaterializer: "This materializer can now be deleted."};
  }
};

export default materializer;
