// Converted from legacy canon_cms_section_visualization #351 "section wage_distribution" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, id, giniCurrYear, tesseract, hierarchy} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, commas} = formatters;

  const measure: string = "Total Population";
  const gender = swap("[[genderWage]]") // allOption, womenOption, menOption
  const genderName = swap("{{[[genderWage]]}}")
  const genderID = gender === "allOption" ? "" : gender === "menOption" ? ";Gender:1" : ";Gender:2"

  const dataNation: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&include=Workforce+Status:true;Nation:01000US${genderID}&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5`
  const dataIndustry: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin,${hierarchy}&include=Workforce+Status:true;${hierarchy}:${id}${genderID}&locale=en&measures=Record+Count%2CTotal+Population&filters=Record+Count.gte.5`

  return {
    data: [dataIndustry, dataNation],
    dataFormat: (resp: any) => {
      const data = resp[1].data.filter((d: any) => d["Year"]*1 <= giniCurrYear * 1).map((d: any) => Object.assign({}, d, {title: "National Average"}))
        .concat(resp[0].data.filter((d: any) => d["Year"]*1 <= giniCurrYear * 1).map((d: any) => Object.assign({}, d, {title: d[`${hierarchy}`]})));
      libs.d3.nest()
        .key((d: any) => `${d.Year}_${d.title}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });

      return data;
    },
    groupBy: "title",
    shapeConfig: {
      fill: (d: any) => d.title === "National Average" ? colorGrey : colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      title: (d: any) => d.title,
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Wage Bin", (d: any) => d["Wage Bin"]],
        ["People in Workforce", (d: any) => commas(d[measure])],
       // ["Margin of Error", (d: any) => `± ${commas(d[`${measure} MOE Appx`])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    legendTooltip: {
      title: (d: any) => d.title
    },
    type: "BarChart",
    x: "Wage Bin",
    xConfig: {
      title: gender === "allOption" ? "Average Salary - (Total Workforce)" : `Average Salary - (${genderName})`
    },
    xSort: (a: any, b: any) => a["Wage Bin ID"] - b["Wage Bin ID"],
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
