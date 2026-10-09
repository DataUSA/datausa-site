// Converted from legacy canon_cms_section_visualization #344 "section top_occ_num_emp" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorMost, id, tesseract, cip2} = variables;
  const {abbreviate, commas, salary} = formatters;

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Detailed+Occupation,Year&include=Workforce+Status:true;CIP2:${cip2}&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Wage+Appx+MOE&filters=Record+Count.gte.5&top=5.Year.Total+Population.desc`
  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=Detailed+Occupation&activity=CIP2&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce+Status:true&filters_measures=Record+Count.gte.5&top=5.Year.Total+Population.desc`

  return {
    data: [dataURL, dataRCA],
    dataFormat: (resp: any) => {
      const dataValues = resp[0].data;
      const dataRCA = resp[1].data;
    
      dataValues.forEach((d: any) => {
        const matchingValue = dataRCA.find((h: any) =>
            h.Year === d.Year &&
            h["Detailed Occupation ID"] === d["Detailed Occupation ID"]
        );
  
        if (matchingValue) {
          d["Total Population RCA"] = matchingValue["Total Population RCA"];
        } else {
          d["Total Population RCA"] = null;
        }
      });
      return dataValues;
    },
    discrete: "y",
    groupBy: "Detailed Occupation",
    height: 250,
    label: (d: any) => d["Detailed Occupation"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: colorMost
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["People in Workforce (RCA)", (d: any) => abbreviate(d["Total Population RCA"])],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`]
      ]
    },
    type: "BarChart",
    x: "Total Population",
    xConfig: {
      labelRotation: 0,
      tickFormat: (d: any) => abbreviate(d),
      title: "People in Workforce"
    },
    y: "Detailed Occupation",
    yConfig: {
      ticks: [],
      title: "Most"
    },
    ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"]
  }
};

export default viz;
