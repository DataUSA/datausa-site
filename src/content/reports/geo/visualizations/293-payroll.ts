// Converted from legacy canon_cms_section_visualization #293 "section payroll" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  let dataCopy: any;
  const {id, tesseract, hierarchy, lenPayroll} = variables;
  const {abbreviate, dollar} = formatters;

  const dataPayroll: string = `${tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=${hierarchy},Year,Industry&include=${hierarchy}:${id};Industry:11%2C21%2C22%2C23%2C31-33%2C42%2C44-45%2C48-49%2C51%2C52%2C53%2C54%2C55%2C56%2C61%2C62%2C71%2C72%2C81%2C92&locale=en&measures=Annual+Payroll` 
  const dataGrowth: string = `${tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,Industry&include=${hierarchy}:${id};Industry:11%2C21%2C22%2C23%2C31-33%2C42%2C44-45%2C48-49%2C51%2C52%2C53%2C54%2C55%2C56%2C61%2C62%2C71%2C72%2C81%2C92&locale=en&measures=Annual+Payroll,Number of Establishments`

  let dataFinal: any = [];

  if(lenPayroll > 1){
    return {
      data: [dataPayroll, dataGrowth],
      dataFormat: (resp: any) => {
        let dataPayroll_ = resp[0].data.map((d: any) => Object.assign({}, d));
        let dataGrowth_ = resp[1].data.map((d: any) => Object.assign({}, d));
      
        dataCopy = dataPayroll_
      
        dataPayroll_.forEach((d: any) => {
          const s = dataCopy.find((h: any) => (h[`Industry ID`] === d[`Industry ID`]) && (h["Year"]*1  === d["Year"]*1 - 1)) || {};
          d["Growth"] = s["Annual Payroll"] ? ((d["Annual Payroll"] - s["Annual Payroll"]) / s["Annual Payroll"])*100 : 0
          d["Shape"] = "Line"
        });
      
        dataGrowth_.forEach((d: any) => {
          d["Shape"] = "Bar"
          delete d["Number of Establishments"]
        })
      
        dataFinal = dataPayroll_.concat(dataGrowth_)
  
        return dataFinal.filter((d: any) => d["Year"] !== 2013)
      },
      groupBy: [
        "Shape"
      ],
      label: (d: any) => " ",
      legendConfig: {
        label: (d: any) => d.Shape === "Bar" ? "Total Annual Payroll ($1000)" : "Average Annual Payroll Change",
        shapeConfig: {
          fill: (d: any) => d.Shape === "Bar" ? "#33c7ad" : "#736dff",
        }
      },
      legendTooltip: {
        tbody: [],
        title: (d: any) => d.Shape === "Bar" ? "Total Annual Payroll ($1000)" : "Average Annual Payroll Change",
      },
      lineMarkerConfig: {
          r: 3,
          fill: "#736dff"
        },
      lineMarkers: true,
      shape: (d: any) => d.Shape,
      shapeConfig: {
        fill: "#33c7ad",
        Line: {
          "stroke": (d: any) => "#736dff",
        }
      },
      tooltipConfig: {
        title: (d: any) => d["Industry"],
        tbody: (d: any) => {
          let customTooltip: any = [];
          d.Shape === "Bar" ?
            customTooltip = [
              ["Year", d["Year"]],
              ["Total Annual Payroll ($1000)", `${dollar(d["Annual Payroll"])}`],
            ]
            :
            customTooltip = [
              ["Year", d["Year"]],
              ["Average Annual Payroll Change", `${abbreviate(d["Growth"])}%`],  
            ]
          return customTooltip;
        }
      },
      time: "Year",
      type: "BarChart",
      x: "Industry",
      xConfig: {
        title: " ",
        ticks: [], 
      },
      y: "Annual Payroll",
      y2: "Growth",
      yConfig: {
        tickFormat: (d: any) => `${dollar(d)}`,
        title: "Total Annual Payroll ($1000)"
      },
      y2Config: {
        tickFormat: (d: any) => `${abbreviate(d)}%`,
        title: "Average Annual Payroll Change"
      },
    }
  }
  else{
    return {
      data: [dataPayroll],
      dataFormat: (resp: any) => {
        let dataPayroll_ = resp.data.map((d: any) => Object.assign({}, d));
        return dataPayroll_;
      },
      groupBy: [hierarchy],
      label: (d: any) => "",
      legend: false,
      shapeConfig: {
        fill: "#33c7ad",
      },
      tooltipConfig: {
        title: (d: any) => d["Industry"],
        tbody: [
          ["Year", (d: any) => d["Year"]],
          ["Total Annual Payroll ($1000)", (d: any) => `${dollar(d["Annual Payroll"])}`],
        ]
      },
      time: "Year",
      type: "BarChart",
      x: "Industry",
      xConfig: {
        title: " ",
        ticks: [], 
      },
      y: "Annual Payroll",
      yConfig: {
        tickFormat: (d: any) => `${dollar(d)}`,
        title: "Total Annual Payroll ($1000)"
      },
    }
  }
};

export default viz;
