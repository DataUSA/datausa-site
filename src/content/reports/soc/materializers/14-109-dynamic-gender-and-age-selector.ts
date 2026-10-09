// Converted from legacy canon_cms_materializer #109 "Dynamic Gender and Age Selector" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 109,
  name: "Dynamic Gender and Age Selector",
  ordering: 14,
  allowed: "always",
  logic: (variables, {swap}) => {
    const measures: any = [
      {"id": "1", "name": "Workforce"},
      {"id": "2", "name": "Average Wage"}
    ]

    let visEmployedGA = measures.map((d: any) => ({
      label: d.name,
      option: `indicator_${d["id"]}`,
      allowed: swap(`visibleEmployed_[[gender-and-age-employment]]`)
    }));

    return {
      visEmployedGA
    };
  }
};

export default materializer;
