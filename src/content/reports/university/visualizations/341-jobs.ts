// Converted from legacy canon_cms_section_visualization #341 "section jobs" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {commonGradsRCAIds, commonJobsIds, colorCIP, iconCIP, id, tesseract} = variables;
  const {abbreviate, commas} = formatters;

  const measure: string = "Total Population";
  const measureEncoded: string = "Total%20Population";

  const urlArray: any = [];

  commonGradsRCAIds.split(",").forEach((d: any) => {
    //const url = `/api/data?CIP2=${d}&Detailed%20Occupation=${commonJobsIds}&measures=${measure},Average%20Wage,Average%20Wage%20Appx%20MOE,Total%20Population%20MOE%20Appx,Record%20Count&Record%20Count>=5&Workforce%20Status=true`;
    const tessUrl: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=CIP2,Detailed+Occupation,Year&include=CIP2:${d};Detailed+Occupation:${commonJobsIds}&locale=en&measures=Record+Count%2CTotal+Population%2CAverage+Wage%2CAverage+Wage+Appx+MOE&filters=Record+Count.gte.5`
    urlArray.push(tessUrl)
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
    
      output.forEach((d: any) => {
        d["CIP2 ID"] = `${d["CIP2 ID"]}`.padStart(2, '0');
      })
  
      return output;
    },
    discrete: "x",
    time: "Year",
    groupBy: ["CIP2"],
    shapeConfig: {
      fill: (d: any) => colorCIP[`${d["CIP2 ID"]}`.padStart(2, '0')]
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Occupation", (d: any) => d["Detailed Occupation ID"]],
        ["Average Salary", (d: any) => `$${commas(d["Average Wage"])}`],
        ["Margin of Error", (d: any) => `± $${commas(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => `${commas(d["Total Population"])}`],
        //["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    legendTooltip: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Average Salary", (d: any) => `$${commas(d["Average Wage"])}`],
        ["Margin of Error", (d: any) => `± $${commas(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => `${commas(d["Total Population"])}`],
        //["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    x: "Detailed Occupation",
    xSort: (a: any, b: any) => b[measure] - a[measure],
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
    y: measure,
    type: "BarChart"
  }
};

export default viz;
