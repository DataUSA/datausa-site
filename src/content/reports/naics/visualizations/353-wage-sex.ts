// Converted from legacy canon_cms_section_visualization #353 "section wage_sex" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, tesseract, hierarchy, id, topCommonOccupationIds, colorGender, iconGender, lastYearOccupationWorkforce} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, commas, salary} = formatters;

  const idsList = topCommonOccupationIds.join(",");
  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation,Gender&measures=Total+Population,Total+Population+MOE+Appx,Record+Count,Average%20Wage,Average%20Wage%20Appx%20MOE&include=${hierarchy}:${id};Workforce+Status:true;Detailed+Occupation:${idsList}&locale=en&filters=Record+Count.gte.5`

  return {
    //data: `/api/data?PUMS Industry=${id}&measure=Record Count,Average Wage,Average Wage Appx MOE,Total Population,Total Population MOE Appx&year=all&drilldowns=Detailed Occupation,Gender&Record Count>=5&Workforce Status=true&PUMS Occupation=${idsList}`,
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.filter((d: any) => d["Year"] * 1 <= lastYearOccupationWorkforce * 1).sort((a: any, b: any) => { return topCommonOccupationIds.indexOf(a["Detailed Occupation ID"]) > topCommonOccupationIds.indexOf(b["Detailed Occupation ID"])?1 : -1});

      data.forEach((d: any) => {
        d.Sex = d.Gender
        d["Sex ID"] = d["Gender ID"]
        delete d.Gender
        delete d["Gender ID"]
      });

      return data;
    },
    groupBy: "Sex",
    shapeConfig: {
      label: false,
      fill: (d: any) => colorGender[d.Sex],
      stroke: (d: any) => colorGender[d.Sex]
    },
    legend:true,
    legendConfig: {
      shapeConfig: {
        backgroundImage: (d: any) => iconGender[d.Sex]
      },
      label:false
    },
    legendTooltip: {
      tbody: []
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`]
      ]
    },
    groupPadding: 10,
    type: "BarChart",
    x: "Detailed Occupation",
    xConfig: {
      labelRotation: false,
      title: "Occupation"
    },
    xSort: (a: any, b: any) => a["Average Wage"] < b["Average Wage"] ? 1 : -1,
    y: "Average Wage",
    yConfig: {
      tickFormat: (d: any) => `${salary(d)}`,
      title: "Average Salary"
    }
  }
};

export default viz;
