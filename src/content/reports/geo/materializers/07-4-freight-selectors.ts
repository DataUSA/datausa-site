// Converted from legacy canon_cms_materializer #4 "Freight Selectors" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 4,
  name: "Freight Selectors",
  ordering: 7,
  allowed: "always",
  logic: (variables) => {
    return {
      ImportDollar: "Domestic Consumption in Dollars",
      ExportDollar: "Domestic Production in Dollars",
      ImportWeight: "Domestic Consumption in Tonnage",
      ExportWeight: "Domestic Production in Tonnage",
      ImportDollarDir: "inbound",
      ExportDollarDir: "outbound",
      ImportWeightDir: "inbound",
      ExportWeightDir: "outbound",
      ImportDollarVal: "dollars",
      ExportDollarVal: "dollars",
      ImportWeightVal: "tonnage",
      ExportWeightVal: "tonnage"
    }
  }
};

export default materializer;
