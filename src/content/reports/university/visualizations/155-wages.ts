// Converted from legacy canon_cms_section_visualization #155 "section wages" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {commonGradsRCAIds, commonJobsHighestWageIds, colorCIP, iconCIP, id, tesseract} = variables;
  const {abbreviate, commas} = formatters;

  const urlArray: any = [];

  commonGradsRCAIds.split(",").forEach((d: any) => {
    const url: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation,CIP2&measures=Total+Population,Total+Population+MOE+Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record+Count&include=CIP2:${d};Workforce+Status:true;Detailed+Occupation:${commonJobsHighestWageIds}&locale=en&filters=Record+Count.gte.5`;
    console.log(url)
    urlArray.push(url)
  })

  return {
    data: urlArray,
    dataFormat: (resp: any) => {
      const output: any = [];
  
      if (resp.length >= 1){
        resp.forEach((d: any) => {
          d.data.forEach((p: any) => {
            output.push(p)
          })
        })
      }
      else {
        resp.data.forEach((d: any) => {
          output.push(d)
        })
      }
  
  
      return output;
    },
    discrete: "x",
    time: "Year",
    groupBy: ["CIP2"],
    shapeConfig: {
      fill: (d: any) => colorCIP[d["CIP2 ID"]]
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Occupation", (d: any) => d["Detailed Occupation ID"]],
        ["Average Salary", (d: any) => `$${commas(d["Average Wage"])}`],
        ["Margin of Error", (d: any) => `± $${commas(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => `${commas(d["Total Population"])}`],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    x: "Detailed Occupation",
    xSort: (a: any, b: any) => b["Average Wage"] - a["Average Wage"],
    xConfig: {
      labelRotation: false
    },
    yConfig: {
      title: "Average Salary",
      tickFormat: (d: any) => `$${commas(d)}`
    },
    barPadding: 0,
    groupPadding: 40,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconCIP[d["CIP2 ID"]]
      }
    },
    y: "Average Wage",
    type: "BarChart"
  }
};

export default viz;
