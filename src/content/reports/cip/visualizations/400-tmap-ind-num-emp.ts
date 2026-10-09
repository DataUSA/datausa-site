// Converted from legacy canon_cms_section_visualization #400 "section tmap_ind_num_emp" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorIndPUMS, iconIndPUMS, idCIP2, tesseract, cip2} = variables;
  const {abbreviateBig, commas, salary} = formatters;

  const data: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Industry+Group,Year&include=CIP2:${cip2};Workforce+Status:true&locale=en&measures=Record+Count%2CTotal+Population,Total+Population+MOE+Appx,Average+Wage%2CAverage+Wage+Appx+MOE&filters=Record+Count.gte.5&parents=true`

  return {
    data: data,
    groupBy: ["Industry Sector", "Industry Group"],
    height: 500,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconIndPUMS[d["Industry Sector ID"]]
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
    time: "Year",
    total: "Total Population",
    totalFormat: (d: any) => `Total: ${abbreviateBig(d)}`,
    type: "Treemap"
  }
};

export default viz;
