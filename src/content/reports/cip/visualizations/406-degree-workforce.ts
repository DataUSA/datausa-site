// Converted from legacy canon_cms_section_visualization #406 "section degree_workforce" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorHighlight, id, tesseract, cip2} = variables;
  const {abbreviate, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const data: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Degree&include=CIP2:${cip2};Workforce+Status:true&locale=en&measures=Record+Count,Total+Population,Total+Population+MOE+Appx,Average+Wage,Average+Wage+Appx+MOE&time=Year.latest&top=5.Year.Total+Population.desc&filters=Record+Count.gte.5`
  const dataRCA: string = `${tesseract}complexity/rca_historical.jsonrecords?cube=pums_5&location=Degree&activity=CIP2&measure=Total+Population&time=Year&cuts=CIP2:${cip2};Workforce+Status:true&having=Record+Count.gte.5&top=5.Year.Total+Population.desc&complementary_measures=Record+Count`

  return {
    data: [data, dataRCA],
    dataFormat: (resp: any) => {
      const dataValues = resp[0].data;
      const dataRCA = resp[1].data;
    
      const msr: string = "Total Population";
    
      dataValues.forEach((d: any) => {
        const matchingValue = dataRCA.find((h: any) =>
            h.Year === d.Year &&
            h["Degree ID"] === d["Degree ID"]
        );
  
        if (matchingValue) {
          d["Total Population RCA"] = matchingValue["Total Population RCA"];
        } else {
          d["Total Population RCA"] = null;
        }
      });
    
       nest()
        .key((d: any) => `${d.Year}`)
        .entries(dataValues)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[msr]);
          group.values.forEach((d: any) => d.share = d[msr] / total);
        });
      
      return dataValues;
    },
    discrete: "y",
    groupBy: "Degree",
    height: 250,
    label: (d: any) => d["Degree"],
    shapeConfig: {
      Bar: {
        labelConfig: {
          textAnchor: "start"
        }
      },
      fill: colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["People in Workforce", (d: any) => commas(d["Total Population"])],
        ["Margin of Error", (d: any) => `± ${commas(d["Total Population MOE Appx"])}`],
        ["People in Workforce (RCA)", (d: any) => abbreviate(d["Total Population RCA"])],
        ["Average Salary", (d: any) => salary(d["Average Wage"])],
        ["Margin of Error", (d: any) => `± ${salary(d["Average Wage Appx MOE"])}`],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
      ]
    },
    type: "BarChart",
    x: "share",
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    },
    y: "Degree",
    yConfig: {
      ticks: [],
      title: "Degree"
    },
    ySort: (a: any, b: any) => a["Total Population"] - b["Total Population"]
  }
};

export default viz;
