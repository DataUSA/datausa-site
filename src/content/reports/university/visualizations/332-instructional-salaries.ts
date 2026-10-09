// Converted from legacy canon_cms_section_visualization #332 "section instructional_salaries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {id, colorHighlight, colorGrey, tesseract, hierarchy} = variables;
  const {abbreviate, commas} = formatters;

  const data1: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional_university&drilldowns=Year,Carnegie+Parent&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
  const data2: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
  
  return {
    data: [data1, data2],
    dataFormat: (resp: any) => {
      const data1 = resp[0].data;
      const data2 = resp[1].data;
    
      const merged = data2.map((d: any) => {
        const item2 = data1.find((s: any) => s.Year === d.Year && d["Carnegie Parent ID"] === s["Carnegie Parent ID"]);
        return {
          "Carnegie Parent": d["Carnegie Parent"],
          "Carnegie Parent ID": d["Carnegie Parent ID"],
          Year: d.Year,
          "Median Total Instructional Employees": item2 ? item2["Median Total Instructional Employees"] : false,
          "Median Outlays Instructional Employees": item2 ? item2["Median Outlays Instructional Employees"] : false,
          "Total Instructional Employees": item2 ? item2["Total Instructional Employees"] : false,
          "Total Outlays Instructional Employees": item2 ? item2["Total Outlays Instructional Employees"] : false,
          "Median Total Salaries": d["Median Total Salaries"],
          "Total Salaries": d["Total Salaries"]
        };
      });
  
      const data = merged.filter((d: any) => 
        d["Median Outlays Instructional Employees"] && d["Median Total Salaries"] && d["Carnegie Parent ID"] !== "NAD"
      );
      data.forEach((d: any) => {
        d["Share"] = d["Median Outlays Instructional Employees"] / d["Median Total Salaries"]
      });
      return data;
    },
    discrete: "x",
    groupBy: ["Carnegie Parent"],
    x: "Year",
    y: "Share",
    yConfig: {
      domain: [0, 1],
      title: "Share",
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`
    },
    legend: false,
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
      }
    },
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["University", (d: any) => d["Carnegie Parent"]],
        ["Number of Employees", (d: any) => commas(d["Median Total Instructional Employees"])],
        ["Staff Salaries", (d: any) => `$${abbreviate(d["Median Outlays Instructional Employees"])}`],
        ["Total Salaries", (d: any) => `$${abbreviate(d["Median Total Salaries"])}`]
      ]
    },
    type: "LinePlot"
  };
};

export default viz;
