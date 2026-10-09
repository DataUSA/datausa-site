// Converted from legacy canon_cms_section_visualization #84 "section top_occ_wage" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorLeast, idCIP2, tesseract, cip2} = variables;
  const {abbreviate, commas, salary} = formatters;

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Detailed+Occupation,Year&include=Workforce+Status:true;CIP2:${cip2}&locale=en&measures=Record+Count,Total+Population,Average+Wage,Average+Wage+Appx+MOE&filters=Record+Count.gte.5&top=5.Year.Average+Wage.asc`
  const moe: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&measures=Total+Population+MOE+Appx,Record+Count,Average+Wage&locale=en&parents=false&include=CIP2:${cip2};Workforce+Status:true&filters=Record+Count.gte.5&top=5.Year.Average+Wage.asc`
  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=Detailed+Occupation&activity=CIP2&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce+Status:true&having=Record+Count.gte.5&complementary_measures=Record+Count,Average+Wage&top=5.Year.Average+Wage.asc`//&top=5.Year.Total+Population.asc

  return {
    data: [dataURL, moe, dataRCA],
    dataFormat: (resp: any) => {
      const dataValues = resp[0].data;
      const dataRCA = resp[2].data;
      const dataMoe = resp[1].data;
    
      dataValues.forEach((d: any) => {
        const matchingValue = dataRCA.find((h: any) =>
          h.Year === d.Year && h["Detailed Occupation ID"] === d["Detailed Occupation ID"]
        );
  
        if (matchingValue) {
          d["Total Population RCA"] = matchingValue["Total Population RCA"];
        } else {
          d["Total Population RCA"] = null;
        }
      });
    
      dataValues.forEach((d: any) => {
        const matchingValue = dataMoe.find((h: any) =>
          h.Year === d.Year && h["Detailed Occupation ID"] === d["Detailed Occupation ID"]
        );
  
        if (matchingValue) {
          d["Total Population MOE Appx"] = matchingValue["Total Population MOE Appx"];
        } else {
          d["Total Population MOE Appx"] = null;
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
      fill: colorLeast
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
    x: "Average Wage",
    xConfig: {
      labelRotation: 0,
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: "Average Salary"
    },
    y: "Detailed Occupation",
    yConfig: {
      ticks: [],
      title: "Lowest"
    },
    ySort: (a: any, b: any) => a["Average Wage"] - b["Average Wage"]
  }
};

export default viz;
