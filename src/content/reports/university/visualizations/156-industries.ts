// Converted from legacy canon_cms_section_visualization #156 "section industries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {commonGradsRCAIds, commonIndustriesIds, colorCIP, iconCIP, id, tesseract} = variables;
  const {abbreviate, commas} = formatters;

  const urlArray: any = [];

  commonGradsRCAIds.split(",").forEach((d: any) => {
    const url: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Industry+Group,CIP2&measures=Total+Population,Total+Population+MOE+Appx,Average%20Wage,Average%20Wage%20Appx%20MOE,Record+Count&include=CIP2:${d};Workforce+Status:true;Industry+Group:${commonIndustriesIds}&locale=en&filters=Record+Count.gte.5`;
    //const url = `/api/data?CIP2=${d}&Industry%20Group=${commonIndustriesIds}&measures=${measure},Average%20Wage,Average%20Wage%20Appx%20MOE,Total%20Population%20MOE%20Appx,Record%20Count&Record%20Count>=5&Workforce%20Status=true`;
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
        ["Industry", (d: any) => d["Industry Group ID"]],
        ["Average Salary", (d: any) => `$${commas(d["Average Wage"])}`],
        ["Margin of Error", (d: any) => `± $${commas(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => `${commas(d["Total Population"])}`],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    x: "Industry Group",
    xSort: (a: any, b: any) => b["Total Population"] - a["Total Population"],
    xConfig: {
      labelRotation: false
    },
    yConfig: {
      title: "People in Workforce",
      tickFormat: (d: any) => `${commas(d)}`
    },
    barPadding: 0,
    groupPadding: 40,
    legendConfig: {
      label: false,
      shapeConfig: {
        backgroundImage: (d: any) => iconCIP[d["CIP2 ID"]]
      }
    },
    y: "Total Population",
    type: "BarChart"
  }
};

export default viz;
