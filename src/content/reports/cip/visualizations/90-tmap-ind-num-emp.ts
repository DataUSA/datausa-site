// Converted from legacy canon_cms_section_visualization #90 "section tmap_ind_num_emp" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters}) => {
  const measure: string = "Total Population,Total Population MOE Appx,Average Wage,Average Wage Appx MOE,Record Count";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const {colorIndPUMS, iconIndPUMS, idCIP2} = variables;
  const {abbreviateBig, commas, salary} = formatters;

  return {
    data: `/api/data?CIP2=${idCIP2}&drilldowns=Industry%20Group&measures=${measureEncoded}&Workforce%20Status=true&Record%20Count>=5&parents=true`,
    groupBy: ["Industry Sector", "Industry Group"],
    height: 500,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconIndPUMS[d["ID Industry Sector"]]
      }
    },
    legendTooltip: {
      title: (d: any) => d["Industry Sector"]
    },
    label: (d: any) => d["Industry Group"],
    shapeConfig: {
      //fill: (d: any) => colorIndPUMS[d["ID Industry Sector"]]
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`]
      ]
    },
    sum: "Total Population",
    time: "ID Year",
    total: "Total Population",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
