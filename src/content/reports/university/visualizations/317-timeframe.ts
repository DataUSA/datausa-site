// Converted from legacy canon_cms_section_visualization #317 "section timeframe" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, locale}) => {
  const {id, colorHighlight, colorGrey, tesseract, hierarchy, idCarnegie, idCarnegieParent} = variables;
  const {abbreviate, commas} = formatters;

  if (hierarchy === "Carnegie Parent") {
  
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Timeframe,Year,Carnegie+Parent&include=${hierarchy}:${id}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
  
    return {
      data: dataCP,
      dataFormat: (resp: any) => {
        const data = resp.data;
    
        return data.filter((d: any) => d["Median Percent Completed BA"] !== null);
      },
      discrete: "x",
      groupBy: ["Carnegie Parent", "Timeframe"],
      x: "Year",
      y: "Median Percent Completed BA",
      yConfig: {
        title: "Percent Completed",
        tickFormat: (d: any) => `${d}%`
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
        }
      },
      legend: false,
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Timeframe", (d: any) => d["Timeframe"]],
          ["University", (d: any) => d["Carnegie Parent"]],
          ["Percent Completed", (d: any) => `${abbreviate(d["Median Percent Completed BA"])}%`],
          ["Students Completed", (d: any) => commas(d["Number Completers BA"])]
        ]
      },
      type: "LinePlot"
    };
  }

  else if (hierarchy === "Carnegie") {
  
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Timeframe,Year,Carnegie&include=${hierarchy}:${id}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Timeframe,Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
  
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
      
        const data = dataC.concat(dataCP)
        return data.filter((d: any) => d["Median Percent Completed BA"] !== null);
      },
      discrete: "x",
      groupBy: ["Carnegie", "Timeframe"],
      x: "Year",
      y: "Median Percent Completed BA",
      yConfig: {
        title: "Percent Completed",
        tickFormat: (d: any) => `${d}%`
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
        }
      },
      legend: false,
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Timeframe", (d: any) => d["Timeframe"]],
          ["University", (d: any) => d["Carnegie"]],
          ["Percent Completed", (d: any) => `${abbreviate(d["Median Percent Completed BA"])}%`],
          ["Students Completed", (d: any) => commas(d["Number Completers BA"])]
        ]
      },
      type: "LinePlot"
    };
  }

  else {
  
    const dataU: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=University,Timeframe,Year&include=${hierarchy}:${id}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Carnegie,Timeframe,Year&include=Carnegie:${idCarnegie}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_graduation_timeframe&drilldowns=Carnegie+Parent,Timeframe,Year&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Number+Completers+BA%2CMedian+Percent+Completed+BA`
  
    return {
      data: [dataU, dataC, dataCP],
      dataFormat: (resp: any) => {
        const dataU = resp[0].data;
        const dataC = resp[1].data;
        const dataCP = resp[2].data;
      
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
      
        const data = dataU.concat(dataC, dataCP);

        return data.filter((d: any) => d["Median Percent Completed BA"] !== null);
      },
      discrete: "x",
      groupBy: ["University", "Timeframe"],
      x: "Year",
      y: "Median Percent Completed BA",
      yConfig: {
        title: "Percent Completed",
        tickFormat: (d: any) => `${d}%`
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
        }
      },
      legend: false,
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Timeframe", (d: any) => d["Timeframe"]],
          ["University", (d: any) => d["University"]],
          ["Percent Completed", (d: any) => `${abbreviate(d["Median Percent Completed BA"])}%`],
          ["Students Completed", (d: any) => commas(d["Number Completers BA"])]
        ]
      },
      type: "LinePlot"
    };
  }

};

export default viz;
