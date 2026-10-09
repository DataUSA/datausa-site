// Converted from legacy canon_cms_section_visualization #290 "section tuition" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract, hierarchy, similarID, idCarnegie, idCarnegieParent, carnegieSimilarIDs} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "State Tuition";
  const measureEncoded = measure.replace(/\s/g, "%20");

  if (hierarchy === "University") {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,University&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=State+Tuition`

    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=State+Tuition`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=State+Tuition`
  
    return {
      data: [data, dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
        const data = resp[0].data;
        const dataCarnegie = resp[1].data;
        const dataCarnegieParent = resp[2].data;

        const dataTemp = data.filter((d: any) => d[`${hierarchy} ID`]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
      
        dataCarnegie.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
        })
  
        dataCarnegieParent.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
        })
      
        const dataFinal = data.concat(dataCarnegie, dataCarnegieParent)
        return dataFinal.filter((d: any) => d.Year <= maxYear);
      },
      groupBy: "University",
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d.University],
          ["Tuition Cost", (d: any) => `$${commas(d["State Tuition"])}`]
        ]
      },
      barPadding: 10,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: measure,
      yConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "State Tuition"
      },
      x: "University",
      xConfig: {
        labelRotation: false
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }

  else {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=State+Tuition`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=State+Tuition`
  
    return {
      data: [dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
        const dataCarnegie = resp[0].data;
        const dataCarnegieParent = resp[1].data;
      
        const dataTemp = dataCarnegie.filter((d: any) => d["Carnegie ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
      
        dataCarnegie.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
        })
  
        dataCarnegieParent.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
        })
      
        const dataFinal = dataCarnegie.concat(dataCarnegieParent);
      
        return dataFinal.filter((d: any) => d.Year <= maxYear);
      },
      groupBy: "University",
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d.University],
          ["Tuition Cost", (d: any) => `$${commas(d["State Tuition"])}`]
        ]
      },
      barPadding: 10,
      groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: measure,
      yConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "State Tuition"
      },
      x: "University",
      xConfig: {
        labelRotation: false
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }
};

export default viz;
