// Converted from legacy canon_cms_section_visualization #331 "section instructional_salaries" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {lengthInstructionalSalaries, id, colorHighlight, colorGrey, hierarchy, tesseract, idCarnegie, idCarnegieParent} = variables;
  const {abbreviate, commas} = formatters;

  // Carnegie

  if (hierarchy === "Carnegie") {
    const data1C: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional_university&drilldowns=Year,Carnegie&include=Carnegie:${id}&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
    const data1CP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional_university&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
    const data2C: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&include=Carnegie:${id}&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
    const data2CP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
  
    return {
      data: [data1C, data1CP, data2C, data2CP],
      dataFormat: (resp: any) => {
        const data1C = resp[0].data;
        const data1CP = resp[1].data;
        const data2C = resp[2].data;
        const data2CP = resp[3].data;
      
        data1CP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
        })
      
        const data1 = data1C.concat(data1CP)
      
        data2CP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
        })
      
        const data2 = data2C.concat(data2CP)
      
        const merged = data2.map((d: any) => {
          const item2 = data1.find((s: any) => s.Year === d.Year && d["Carnegie ID"] === s["Carnegie ID"]);
          return {
            "Carnegie": d["Carnegie"],
            "Carnegie ID": d["Carnegie ID"],
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
          (d["Median Outlays Instructional Employees"] && d["Median Total Salaries"]) || (d["Total Outlays Instructional Employees"] && d["Total Salaries"])
        );
        data.forEach((d: any) => {
          d["Share"] = (d["Median Outlays Instructional Employees"] / d["Median Total Salaries"]) || d["Total Outlays Instructional Employees"] / d["Total Salaries"];
          d["Employees"] = d["Median Total Instructional Employees"] || d["Total Instructional Employees"];
          d["Staff"] = d["Median Outlays Instructional Employees"] || d["Total Outlays Instructional Employees"];
          d["Salary"] = d["Median Total Salaries"] || d["Total Salaries"];
        });
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie"],
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
          stroke: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["Carnegie"]],
          ["Number of Employees", (d: any) => commas(d["Employees"])],
          ["Staff Salaries", (d: any) => `$${abbreviate(d["Staff"])}`],
          ["Total Salaries", (d: any) => `$${abbreviate(d["Salary"])}`],
          ["Share", (d: any) => `${abbreviate(d["Share"] * 100)}%`]
        ]
      },
      type: "LinePlot"
    };
  }

  // University

  else {
  
    const data1U: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year,University&include=University:${id}&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
    const data1C: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
    const data1CP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_salaries_instructional&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Total+Instructional+Employees%2CTotal+Outlays+Instructional+Employees%2CMedian+Total+Instructional+Employees%2CMedian+Outlays+Instructional+Employees`
  
    const data2U: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,University&include=University:${id}&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
    const data2C: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
    const data2CP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Total+Salaries%2CMedian+Total+Salaries`
  
    return {
      data: [data1U, data1C, data1CP, data2U, data2C, data2CP],
      dataFormat: (resp: any) => {
        const data1U = resp[0].data;
        const data1C = resp[1].data;
        const data1CP = resp[2].data;
        const data2U = resp[3].data;
        const data2C = resp[4].data;
        const data2CP = resp[5].data;
      
        data1C.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
          delete d["Carnegie ID"]
          delete d["Carnegie"]
        })      
      
        data1CP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
        })
      
        const data1 = data1U.concat(data1C, data1CP)
      
        data2C.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
          delete d["Carnegie ID"]
          delete d["Carnegie"]
        })
      
        data2CP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
        })
      
        const data2 = data2U.concat(data2C, data2CP)
      
        const dataTemp = data2.filter((d: any) => d["University ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);
      
        const merged = data2.map((d: any) => {
          const item2 = data1.find((s: any) => s.Year === d.Year && d["University ID"] === s["University ID"]);
          return {
            "University": d["University"],
            "University ID": d["University ID"],
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
          (d["Median Outlays Instructional Employees"] && d["Median Total Salaries"]) || (d["Total Outlays Instructional Employees"] && d["Total Salaries"])
        );
        data.forEach((d: any) => {
          d["Share"] = (d["Median Outlays Instructional Employees"] / d["Median Total Salaries"]) || d["Total Outlays Instructional Employees"] / d["Total Salaries"];
          d["Employees"] = d["Median Total Instructional Employees"] || d["Total Instructional Employees"];
          d["Staff"] = d["Median Outlays Instructional Employees"] || d["Total Outlays Instructional Employees"];
          d["Salary"] = d["Median Total Salaries"] || d["Total Salaries"];
        });
      
        return data.filter((d: any) => d.Year*1 >= minYear && d.Year*1 <= maxYear);
      },
      discrete: "x",
      groupBy: ["University"],
      x: "Year",
      y: "Share",
      yConfig: {
        //domain: [0, 1],
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
        },
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["University"]],
          ["Number of Employees", (d: any) => commas(d["Employees"])],
          ["Staff Salaries", (d: any) => `$${abbreviate(d["Staff"])}`],
          ["Total Salaries", (d: any) => `$${abbreviate(d["Salary"])}`],
          ["Share", (d: any) => `${abbreviate(d["Share"] * 100)}%`]
        ]
      },
      type: lengthInstructionalSalaries === 1 ? "BarChart" : "LinePlot"
    };
  }

};

export default viz;
