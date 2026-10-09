// Converted from legacy canon_cms_section_visualization #294 "section establishments" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {hierarchy, id, tesseract, colorScaleGood} = variables;
  const {abbreviate, commas} = formatters;
  const {sum, nest} = libs.d3;

  const selector = swap("[[establishmentSize]]") // numberOfEmployees, numberOfEstablishments
  const measure = selector === "numberOfEstablishments" ? "Number of Establishments" : "Employees"
  const measureTitle = selector === "numberOfEstablishments" ? "Number of Establishments" : "Number of Employees"
  const selectorMetric = swap("[[establishmentSizeMetric]]") // value, share

  const industrySelector = swap("[[establishmentSizeIndustries]]") // valueMeasure, percentage
  let industryID: any = ""

  if (industrySelector == "industry_0") {
    industryID = "11,21,22,23,31-33,42,44-45,48-49,51,52,53,54,55,56,61,62,71,72,81"
  }

  else {
    industryID = industrySelector.replace("industry_", "")
  }

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=county_business_patterns&drilldowns=Year,Size,Industry&include=${hierarchy}:${id};Industry:${industryID}&locale=en&measures=${measure}`;
  //console.log(dataURL)
  const sizeRangeMax: Record<string, any> = {
    1: 4,
    2: 9,
    3: 19,
    4: 49,
    5: 99,
    6: 249,
    7: 499,
    8: 999,
    9: 2000
  }


  if (industrySelector == "industry_0") {
  
    return {
      data: dataURL,
      dataFormat: (resp: any) => {
        const data = resp.data;
      
        data.forEach((d: any) => {
          d["Size"] = d["Size ID"] === 9 ? "1,000 or More Employee Size Class" : d["Size"]
        });
      
        nest()
          .key((d: any) => `${d.Year}_${d["Industry"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]) 
            group.values.forEach((d: any) => {
                d["Share"] = (d[measure] / total) * 100
            });
          });
        
          data.forEach((d: any) => {
            d["Size"] = d["Size"].replace("Employee Size Class", "")
          })
        
        return data;
      },
      colorScalePosition: false,
      colorScale: "Size ID",
      colorScaleConfig: {
        scale: "linear"
      },
      discrete: "y",
      groupBy: ["Size"],  
      legend: true,
      legendSort: (a: any, b: any) => a["Size ID"] - b["Size ID"],
      legendConfig: {
       label: "",
       shapeConfig: {
          fill: "D3PLUS-COMMON-RESET", 
        },
      },
      stackOrder: ["1-4", "5-9", "10-19", "20-49", "50-99", "100-249", "250-499", "500-999", "1,000 or More"],
      shapeConfig: {
        fill: "D3PLUS-COMMON-RESET",
      }, 
      time: "Year",
      type: "BarChart",
      x: selectorMetric === "share" ? "Share" : measure,
      ySort: (a: any, b: any) => b["Industry"].localeCompare(a["Industry"]),
      y: "Industry",
      stacked: true,
      height: 550,
      xConfig: {
        tickFormat: selectorMetric === "share" ? (d: any) => `${abbreviate(d)}%` : (d: any) => `${abbreviate(d)}`,
        title: " "
      },
      yConfig: {
        labelOffset: false,
        tickSize: 3,
        maxSize: 210,
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d["Year"]],
          ["Industry", (d: any) => d["Industry"]],
          [selector === "establishments" ? "Number of Establishments" : "Number of Employees", (d: any) => commas(d[measure])],
          ["Share", (d: any) => `${abbreviate(d["Share"])}%`],
        ]
      }
    }
  }

  else {
    return {
      data: dataURL,
      dataFormat: (resp: any) => {
        const data = resp.data;
        data.forEach((d: any) => {
          d["Size"] = d["Size ID"] === 9 ? "1,000 or More Employee Size Class" : d["Size"]
        });
         nest()
          .key((d: any) => `${d.Year}_${d["Industry"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]) 
            group.values.forEach((d: any) => {
                d["Share"] = (d[measure] / total) * 100
            });
          });
        
          data.forEach((d: any) => {
            d["Size"] = d["Size"].replace("Employee Size Class", "")
          })
        
        return data;
      },
      groupBy: "Size",
      legend: true,
      legendSort: (a: any, b: any) => a["Size ID"] - b["Size ID"],
      legendConfig: {
        label: false,
        shapeConfig: {
          fill: "D3PLUS-COMMON-RESET", 
        }
      },
      colorScalePosition: false,
      colorScale: "Size ID",
      colorScaleConfig: {
        scale: "linear"
      },
      stackOrder: ["1-4", "5-9", "10-19", "20-49", "50-99", "100-249", "250-499", "500-999", "1,000 or More"],
      //time: "Year",
      type: "StackedArea",
      shapeConfig: {
        fill: "D3PLUS-COMMON-RESET",
        Area: {
          label: (d: any) => `${d["Size"]} Employees`
        }
      },
      x: "Year",
      y: selectorMetric === "share" ? "Share" : measure,
      yConfig: {
        tickFormat: selectorMetric === "share" ? (d: any) => `${abbreviate(d)}%` : (d: any) => `${abbreviate(d)}`,
        title: selectorMetric === "share" ? "Share" : measureTitle,
      },
      height: 550,
      tooltipConfig: {
        title: (d: any) => `${d["Size"]} Employees`,
        tbody: [
          ["Year", (d: any) => d["Year"]],
          ["Industry", (d: any) => d["Industry"]],
          [selector === "numberOfEstablishments" ? "Number of Establishments" : "Number of Employees", (d: any) => commas(d[measure])],
          ["Share", (d: any) => `${abbreviate(d["Share"])}%`],
        ]
      }
    }
  }
};

export default viz;
