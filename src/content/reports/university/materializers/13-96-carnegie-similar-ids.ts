// Converted from legacy canon_cms_materializer #96 "Carnegie Similar IDs" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 96,
  name: "Carnegie Similar IDs",
  ordering: 13,
  allowed: "always",
  logic: (variables) => {
    const carnegieSimilarIDs: Record<string, any> = {
      "-2": {ids: "1,15,16,17,18"},
      "1": {ids: "-2,15,16,17,18"},
      "2": {ids: "1,15,16,17,18,-2"},
      "3": {ids: "1,15,16,17,18,-2"},
      "4": {ids: "1,15,16,17,18,-2"},
      "5": {ids: "1,15,16,17,18,-2"},
      "6": {ids: "1,15,16,17,18,-2"},
      "7": {ids: "1,15,16,17,18,-2"},
      "8": {ids: "1,15,16,17,18,-2"},
      "9": {ids: "1,15,16,17,18,-2"},
      "10": {ids: "1,15,16,17,18,-2"},
      "11": {ids: "1,15,16,17,18,-2"},
      "12": {ids: "1,15,16,17,18,-2"},
      "13": {ids: "1,15,16,17,18,-2"},
      "14": {ids: "1,15,16,17,18,-2"},
      "15": {ids: "1,16,17,18,-2"},
      "16": {ids: "1,15,17,18,-2"},
      "17": {ids: "1,15,16,18,-2"},
      "18": {ids: "1,15,16,17,-2"},
      "19": {ids: "1,15,16,17,18,-2"},
      "20": {ids: "1,15,16,17,18,-2"},
      "21": {ids: "1,15,16,17,18,-2"},
      "22": {ids: "1,15,16,17,18,-2"},
      "23": {ids: "1,15,16,17,18,-2"},
      "24": {ids: "1,15,16,17,18,-2"},
      "25": {ids: "1,15,16,17,18,-2"},
      "26": {ids: "1,15,16,17,18,-2"},
      "27": {ids: "1,15,16,17,18,-2"},
      "28": {ids: "1,15,16,17,18,-2"},
      "29": {ids: "1,15,16,17,18,-2"},
      "30": {ids: "1,15,16,17,18,-2"},
      "31": {ids: "1,15,16,17,18,-2"},
      "32": {ids: "1,15,16,17,18,-2"},
      "33": {ids: "1,15,16,17,18,-2"},
    }


    return {
      carnegieSimilarIDs
    }
  }
};

export default materializer;
