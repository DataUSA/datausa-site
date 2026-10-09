// Converted from legacy canon_cms_section_visualization #327 "section salaries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  let dataCP: any;
  const {id, colorHighlight, colorGrey, tesseract, hierarchy} = variables;
  const {abbreviate} = formatters;

  dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`

  return {
   // data: `/api/data?measures=Median Total Salaries,Median Salary Expenses,Median Total Expenses&drilldowns=Carnegie Parent`,
    data: dataCP,
    dataFormat: (resp: any) => {
      const data = resp.data;
      data.forEach((d: any) => {
        d["share"] = d["Median Total Salaries"] / d["Median Total Expenses"];
      });
      return data;
    },
    discrete: "x",
    groupBy: ["Carnegie Parent"],
    x: "Year",
    y: "share",
    yConfig: {
      // domain: [0, 1],
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
        ["Total Salaries", (d: any) => `$${abbreviate(d["Median Total Salaries"])}`],
        ["Total Expenses", (d: any) => `$${abbreviate(d["Median Total Expenses"])}`],
        ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
      ]
    },
    type: "LinePlot"
  };
};

export default viz;
