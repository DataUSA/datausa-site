// Converted from legacy canon_cms_section_visualization #343 "section locations" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale, albersUsaPr}) => {
  const {idCIP2, cip2, tesseract} = variables;
  const {abbreviate, salary} = formatters;

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=PUMA,Year&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Wage+Appx+MOE&include=CIP2:${cip2};Workforce+Status:true&filters=Record+Count.gte.5`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data;
      return data
    },
    colorScale: "Average Wage",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => salary(d),
        title: "Average Salary"
      }
    },
    groupBy: "PUMA ID",
    height: 500,
    label: (d: any) => d["PUMA"],
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± $${abbreviate(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => abbreviate(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${abbreviate(d["Total Population MOE Appx"])}`],
      ]
    },
    ocean: "transparent",
    projection: typeof window !== "undefined" ? albersUsaPr() : "geoAlbersUsa",
    topojson: `/topojson/PUMA.json`,
    time: "Year",
    type: "Geomap",
    topojsonId: (d: any) => d.id
  };

};

export default viz;
