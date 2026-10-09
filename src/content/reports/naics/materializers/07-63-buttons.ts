// Converted from legacy canon_cms_materializer #63 "Buttons" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 63,
  name: "Buttons",
  ordering: 7,
  allowed: "always",
  logic: (variables) => {
    return {
      workforce: "Workforce",
      wage: "Average Wage",
      specialization: "Specialization",
      states: "States",
      pumas: "PUMAs",
      allOption: "All",
      womenOption: "Women",
      menOption: "Men",
      valueOption: "Value",
      growthOption: "Yearly Change",
      establishments: "Establishments",
      payroll: "Payroll",
      genderRace: "Gender and Race",
      races: "Races",
      jobGrowth: "Job Growth",
      outputOption: "Output Growth"
    }
  }
};

export default materializer;
