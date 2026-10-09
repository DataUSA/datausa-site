// Converted from legacy canon_cms_section_visualization #85 "section tmap_occ_num_emp_degree" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const {colorOccPUMS, iconOccPUMS, idCIP2} = variables;
  const {abbreviateBig, commas, salary} = formatters;

  return {
    data: `/api/data?CIP2=${idCIP2}&measure=Total%20Population,Total%20Population%20MOE%20Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record%20Count&Workforce%20Status=true&drilldowns=Detailed%20Occupation&parents=true&Record%20Count>=5`,
    groupBy: ["Major Occupation Group", "Detailed Occupation"],
    height: 500,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconOccPUMS[d["ID Major Occupation Group"]]
      }
    },
    shapeConfig: {
      fill: (d: any) => colorOccPUMS[d["ID Major Occupation Group"]]
    },
    sum: (d: any) => d["Total Population"],
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`]
      ]
    },
    total: "Total Population",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
