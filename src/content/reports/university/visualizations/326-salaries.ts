// Converted from legacy canon_cms_section_visualization #326 "section salaries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  let dataC: any; let dataCP: any; let dataU: any;
  const {lengthSalaryExp, id, colorHighlight, colorGrey, hierarchy, tesseract, idCarnegieParent, idCarnegie} = variables;
  const {abbreviate} = formatters;

  if (hierarchy === "Carnegie") {
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&include=Carnegie:${id}&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`

    return {
      data: [dataC, dataCP],
      dataFormat: (resp: any) => {
        const dataC = resp[0].data;
        const dataCP = resp[1].data;
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const dataFinal = dataC.concat(dataCP)
      
        dataFinal.forEach((d: any) => {
          d["share"] = d["Median Total Salaries"] / d["Median Total Expenses"];
        });
        return dataFinal;
      },
      discrete: "x",
      groupBy: ["Carnegie"],
      x: "Year",
      y: "share",
      yConfig: {
        domain: [0, 1],
        title: "Share",
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`
      },
      legend: false,
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["Carnegie"]],
          ["Median Salaries", (d: any) => `$${abbreviate(d["Median Total Salaries"])}`],
          ["Median Expenses", (d: any) => `$${abbreviate(d["Median Total Expenses"])}`],
          ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
        ]
      },
      type: "LinePlot"
    };
  }

  else {
  
    dataU = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,University&include=University:${id}&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Total+Expenses%2CMedian+Total+Salaries`
  
    return {
      data: [dataC, dataCP, dataU],
      dataFormat: (resp: any) => {
        const dataC = resp[0].data;
        const dataCP = resp[1].data;
        const dataU = resp[2].data;
      
        const dataTemp = dataU.filter((d: any) => d["University ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);
      
        dataC.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
          delete d["Carnegie"]
          delete d["Carnegie ID"]
        })
      
        dataCP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const dataFinal = dataU.concat(dataC, dataCP)
      
        dataFinal.forEach((d: any) => {
          d["share"] = d["Median Total Salaries"] / d["Median Total Expenses"];
        });
        return dataFinal.filter((d: any) => d.Year*1 >= minYear*1 && d.Year*1 <= maxYear*1);
      },
      discrete: "x",
      groupBy: ["University"],
      x: "Year",
      y: "share",
      yConfig: {
        domain: [0, 1],
        title: "Share",
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`
      },
      legend: false,
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
        },
        Bar: {
          fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["University"]],
          ["Median Salaries", (d: any) => `$${abbreviate(d["Median Total Salaries"])}`],
          ["Median Expenses", (d: any) => `$${abbreviate(d["Median Total Expenses"])}`],
          ["Share", (d: any) => `${abbreviate(d["share"] * 100)}%`]
        ]
      },
      type: lengthSalaryExp === 1 ? "BarChart" : "LinePlot"
    };
  }

};

export default viz;
