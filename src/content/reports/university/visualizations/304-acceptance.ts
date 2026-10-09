// Converted from legacy canon_cms_section_visualization #304 "section acceptance" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, applicantsYearCurr, tesseract, similarID, hierarchy, idCarnegie, idCarnegieParent, carnegieSimilarIDs} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Admissions Total,Applicants Total";
  const measureEncoded = measure.replace(/\s/g, "%20");


  if (hierarchy == "University") {

    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const dataUniversity: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,${hierarchy}&include=${hierarchy}:${id},${similarIDs}&locale=en&measures=Applicants+Total%2CAdmissions+Total`
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Applicants+Total%2CAdmissions+Total`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Applicants+Total%2CAdmissions+Total`

    return {
      data: [dataUniversity, dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
      
        const data = resp[0].data;
        const dataCarnegie = resp[1].data;
        const dataCarnegieParent = resp[2].data;
      
        const dataTemp = data.filter((d: any) => d[`${hierarchy} ID`]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);
      
        dataCarnegie.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
        })
  
        dataCarnegieParent.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
        })
      
        const dataConcat = data.concat(dataCarnegie, dataCarnegieParent)
      
        const dataFinal = dataConcat;
        dataFinal.forEach((d: any) => {
          d["Acceptance Rate"] = d["Admissions Total"] / d["Applicants Total"];
        });
      
        let data_ = dataFinal.filter((d: any) => d["Year"] <= applicantsYearCurr)
      
        return data_.filter((d: any) => d.Year*1 >= minYear*1 && d.Year*1 <= maxYear*1 && d["Acceptance Rate"] !== null);
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
          ["Applicants", (d: any) => `${commas(d["Applicants Total"])}`],
          ["Admissions", (d: any) => `${commas(d["Admissions Total"])}`],
          ["Acceptance Rate", (d: any) => `${abbreviate(d["Acceptance Rate"] * 100)}%`]
        ]
      },
      barPadding: 0,
      type: "BarChart",
      legend: false,
      x: "Acceptance Rate",
      xConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Acceptance Rate"
      },
      y: "University",
      yConfig: {
        labelRotation: false,
        title: "University",
        ticks: []
      },
      ySort: (a: any, b: any) => a["Acceptance Rate"] - b["Acceptance Rate"]
    }
  }

  else {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const dataCarnegie: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,Carnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Applicants+Total%2CAdmissions+Total`
    const dataCarnegieParent: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_admissions&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Applicants+Total%2CAdmissions+Total`
  
    return {
      data: [dataCarnegie, dataCarnegieParent],
      dataFormat: (resp: any) => {
      
        const dataCarnegie = resp[0].data;
        const dataCarnegieParent = resp[1].data;
      
        dataCarnegie.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
        })
  
        dataCarnegieParent.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
        })
      
        const dataConcat = dataCarnegie.concat(dataCarnegieParent)
      
        const dataFinal = dataConcat;
        dataFinal.forEach((d: any) => {
          d["Acceptance Rate"] = d["Admissions Total"] / d["Applicants Total"];
        });
      
        let data_ = dataFinal.filter((d: any) => d["Year"] <= applicantsYearCurr)
      
        return data_;
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
          ["Applicants", (d: any) => `${commas(d["Applicants Total"])}`],
          ["Admissions", (d: any) => `${commas(d["Admissions Total"])}`],
          ["Acceptance Rate", (d: any) => `${abbreviate(d["Acceptance Rate"] * 100)}%`]
        ]
      },
      barPadding: 0,
      // groupPadding: 40,
      type: "BarChart",
      legend: false,
      x: "Acceptance Rate",
      xConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Acceptance Rate"
      },
      y: "University",
      yConfig: {
        labelRotation: false,
        title: "University",
        ticks: []
      },
      ySort: (a: any, b: any) => a["Acceptance Rate"] - b["Acceptance Rate"]
    }
  }
};

export default viz;
