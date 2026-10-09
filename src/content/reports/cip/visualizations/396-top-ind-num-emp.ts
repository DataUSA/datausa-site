// Converted from legacy canon_cms_section_visualization #396 "section top_ind_num_emp" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {colorMost, idCIP2, tesseract, cip2} = variables;
  const {abbreviate, commas, salary} = formatters;

  const dataURL: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Industry+Group,Year&include=Workforce+Status:true;CIP2:${cip2}&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Wage+Appx+MOE&filters=Record+Count.gte.5&top=6.Year.Total+Population.desc&complementary_measures=Record+Count`
  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=Industry+Group&activity=CIP2&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce+Status:true&having=Record+Count.gte.5&top=6.Year.Total+Population.desc&complementary_measures=Record+Count`

  return {
    data: [dataURL, dataRCA],
    dataFormat: (resp: any) => {
      const dataValues = resp[0].data;
      const dataRCA = resp[1].data;
    
      dataValues.forEach((d: any) => {
        const matchingValue = dataRCA.find((h: any) =>
            h.Year === d.Year &&
            h["Industry Group ID"] === d["Industry Group ID"]
        );
  
        if (matchingValue) {
          d["Total Population RCA"] = matchingValue["Total Population RCA"];
        } else {
          d["Total Population RCA"] = null;
        }
      });
    
      const groupedByYear: Record<string, any> = {};

      dataValues.forEach((d: any) => {
        if (d["Industry Group ID"] !== "") {
          const year = d["Year"];
          if (!groupedByYear[year]) groupedByYear[year] = [];
          groupedByYear[year].push(d);
        }
      });
    
      const data = Object.values(groupedByYear).flatMap((yearGroup: any) =>
        yearGroup
          .sort((a: any, b: any) => b["Total Population"] - a["Total Population"])
          .slice(0, 5)
      );

      return data;
    },
    discrete: "y",
    groupBy: "Industry Group",
    height: 250,
    label: (d: any) => d["Industry Group"],
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
      tickFormat: (d: any) => abbreviate(d),
      title: "People in Workforce"
    },
    y: "Industry Group",
    yConfig: {
      ticks: [],
      title: "Most"
    },
    ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"]
  }
};

export default viz;
