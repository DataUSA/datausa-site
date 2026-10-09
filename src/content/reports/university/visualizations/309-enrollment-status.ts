// Converted from legacy canon_cms_section_visualization #309 "section enrollment_status" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, idCarnegie, tesseract, hierarchy, carnegieSimilarIDs, similarID, idCarnegieParent} = variables;
  const {abbreviate, commas, salary} = formatters;

  const {nest, sum} = libs.d3;
  const measure: string = "Enrollment";
  const measureEncoded = measure.replace(/\s/g, "%20");

  let dataC
  let dataU
  let dataCP

  if (hierarchy === "Carnegie"){
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&include=Carnegie:${id},${similarIDs}&drilldowns=Enrollment+Status,Carnegie,Year&locale=en&measures=Enrollment`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Enrollment+Status,Carnegie+Parent,Year&locale=en&measures=Enrollment`
  
    return {
      data: [dataC, dataCP],
      dataFormat: (resp: any) => {
      
        let dataC = resp[0].data;
        let dataCP = resp[1].data;
      
        const dataTemp = dataC.filter((d: any) => d["Carnegie ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year)
      
        dataC.forEach((d: any) => {
          d["Carnegie ID"] = `${d["Carnegie ID"]}`
        })
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = `${d["Carnegie Parent ID"]}`
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const data_ = dataC.concat(dataCP);
        const data = data_.filter((d: any) => d["Year"]*1 <= maxYear*1);
      
        let dataFinal = data;
        nest()
          .key((d: any) => `${d.Year}_${d["Carnegie"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        
        return dataFinal;
      },
      discrete: "x",
      groupBy: ["Enrollment Status"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["Carnegie ID"] === id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["Carnegie"]],
          ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
          ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
        ]
      },
      barPadding: 0,
      type: "BarChart",
      legend: false,
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      x: "Carnegie",
      xConfig: {
        labelRotation: false,
        title: "Carnegie"
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }

  else {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    dataU = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&include=University:${id},${similarIDs}&drilldowns=Enrollment+Status,University,Year&locale=en&measures=Enrollment`
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&include=Carnegie:${idCarnegie}&drilldowns=Enrollment+Status,Carnegie,Year&locale=en&measures=Enrollment`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Enrollment+Status,Carnegie+Parent,Year&locale=en&measures=Enrollment`
  
    return {
      data: [dataC, dataCP, dataU],
      dataFormat: (resp: any) => {
      
        let dataC = resp[0].data;
        let dataCP = resp[1].data;
        let dataU = resp[2].data;
      
        const dataTemp = dataU.filter((d: any) => d["University ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year)
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year)

        dataC.forEach((d: any) => {
          d["University ID"] = `${d["Carnegie ID"]}`
          d["University"] = d["Carnegie"]
        })
      
        dataCP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = `${d["Carnegie Parent ID"]}`
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        dataU.forEach((d: any) => {
          d["University ID"] = `${d["University ID"]}`
        })
      
        const data_ = dataU.concat(dataC, dataCP)
        const data = data_.filter((d: any) => d["Year"]*1 <= maxYear*1 && d["Year"]*1 >= minYear*1);
      
        let dataFinal = data;
        nest()
          .key((d: any) => `${d.Year}_${d["University"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        
        return dataFinal;
      },
      discrete: "x",
      groupBy: ["Enrollment Status"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["University ID"] === id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["University"]],
          ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
          ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
        ]
      },
      barPadding: 0,
      type: "BarChart",
      legend: false,
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      x: "University",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }
};

export default viz;
