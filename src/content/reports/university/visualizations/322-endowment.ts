// Converted from legacy canon_cms_section_visualization #322 "section endowment" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {id, colorHighlight, colorGrey, tesseract} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;

  return {
    //data: `/api/data?drilldowns=Carnegie Parent&measures=Median Endowment Value`,
    data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Carnegie+Parent%2CYear&locale=en&measures=Median+Endowment+Value`,
    dataFormat: (resp: any) => {
      const data = resp.data;
      nest()
        .key((d: any) => `${d.Year}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d["Median Endowment Value"]);
          group.values.forEach((d: any) => d.share = d["Median Endowment Value"] / total);
        });
      return data;
    },
    discrete: "x",
    groupBy: ["Carnegie Parent"],
    legendConfig: {
      shapeConfig: {
        // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
      }
    },
    groupPadding: 40,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Expenditure", (d: any) => `$${abbreviate(d["Median Endowment Value"])}`]
      ]
    },
    shapeConfig: {
      Line: {
        stroke: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
      }
    },
    legend: false,
    x: "Year",
    y: "Median Endowment Value",
    yConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`
    },
    type: "LinePlot"
  }
};

export default viz;
