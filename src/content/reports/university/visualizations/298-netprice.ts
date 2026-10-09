// Converted from legacy canon_cms_section_visualization #298 "section netprice" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, idCarnegie, idCarnegieParent, similarID, tesseract, hierarchy, carnegieSimilarIDs} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Median Average Net Price Grant Or Scholarship Aid";
  const measureEncoded = measure.replace(/\s/g, "%20");


  if (hierarchy === "University") {

    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`

    return {
      data: [data, dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
        const data = resp[0].data;
        const dataCarnegie = resp[1].data;
        const dataCarnegieParent = resp[2].data;
      
        const dataTemp = data.filter((d: any) => d[`${hierarchy} ID`]*1 === id*1 && d[measure] !== null);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year)
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year)
      
        dataCarnegie.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
        })
      
        dataCarnegieParent.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
        })
      
        const dataFinal = data.concat(dataCarnegie, dataCarnegieParent)
      
        return dataFinal.filter((d: any) => d.Year*1 >= minYear*1 && d.Year*1 <= maxYear*1)
      },
      discrete: "y",
      groupBy: ["University"],
      shapeConfig: {
        Bar: {
          labelConfig: {
            textAnchor: "start"
          }
        },
        fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Average Net Price", (d: any) => `$${commas(d[measure])}`]
        ]
      },
      barPadding: 0,
      type: "BarChart",
      legend: false,
      x: measure,
      xConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`,
        title: "Average Net Price"
      },
      y: "University",
      yConfig: {
        labelRotation: false,
        title: "University",
        ticks: []
      },
      ySort: (a: any, b: any) => a[measure] - b[measure]
    }
  }

  else {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_university&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Average+Net+Price+Grant+Or+Scholarship+Aid`
  
    return {
      data: [dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
        const dataCarnegie = resp[0].data;
        const dataCarnegieParent = resp[1].data;
      
        const dataTemp = dataCarnegie.filter((d: any) => d["Carnegie ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year)
      
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
      discrete: "y",
      barPadding: 0,
      shapeConfig: {
        Bar: {
          labelConfig: {
            textAnchor: "start"
          }
        },
        fill: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Average Net Price", (d: any) => `$${commas(d[measure])}`]
        ]
      },
      type: "BarChart",
      legend: false,
      x: measure,
      xConfig: {
        tickFormat: (d: any) => `$${commas(d)}`,
        title: "Average Net Price"
      },
      y: "University",
      yConfig: {
        labelRotation: false,
        title: "University",
        ticks: []
      },
      ySort: (a: any, b: any) => a[measure] - b[measure]
    }
  }
};

export default viz;
