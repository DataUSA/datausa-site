// Converted from legacy canon_cms_section_visualization #393 "section top_occ_rca" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorLeast, idCIP2, tesseract, cip2} = variables;
  const {abbreviate, commas, salary} = formatters;

  const data: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=CIP2&activity=Detailed+Occupation&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce+Status:true&having=Record+Count.gte.5&top=5.Year.Total+Population+RCA.asc&complementary_measures=Record+Count,Average+Wage,Average+Wage+Appx+MOE`
  const moe: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Detailed+Occupation&measures=Total+Population+MOE+Appx,Record+Count&locale=en&parents=false&include=CIP2:${cip2};Workforce+Status:true&filters=Record+Count.gte.5`

  return {
    data: [data, moe],
    dataFormat: (resp: any) => {
      const dataValues = resp[0].data;
      const dataMoe = resp[1].data;

      dataValues.forEach((d: any) => {
        const matchingValue = dataMoe.find((h: any) =>
          h.Year*1 === d.Year*1 &&
          String(h["Detailed Occupation ID"]) === String(d["Detailed Occupation ID"])
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
    x: "Total Population RCA",
    xConfig: {
      labelRotation: 0,
      tickFormat: (d: any) => abbreviate(d),
      title: "People in Workforce (RCA)"
    },
    y: "Detailed Occupation",
    yConfig: {
      ticks: [],
      title: "Least"
    },
    ySort: (a: any, b: any) => a["Total Population RCA"] - b["Total Population RCA"]
  }
};

export default viz;
