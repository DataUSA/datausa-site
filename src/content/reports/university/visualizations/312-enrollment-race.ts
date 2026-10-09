// Converted from legacy canon_cms_section_visualization #312 "section enrollment_race" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, hierarchy, tesseract, idCarnegieParent, idCarnegie, carnegieSimilarIDs, similarID} = variables;
  const {abbreviate, commas, salary} = formatters;

  const {nest, sum} = libs.d3;
  const measure: string = "Enrollment";
  const measureEncoded = measure.replace(/\s/g, "%20");

  if (hierarchy === "Carnegie Parent") {
    return {
      data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race,Year,Carnegie+Parent&include=Carnegie+Parent:${id}&locale=en&measures=Enrollment`,
      dataFormat: (resp: any) => {
        const data = resp.data.filter((d: any) => d["IPEDS Race ID"] !== "unknown");
        nest()
          .key((d: any) => `${d.Year}_${d["Carnegie Parent"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie Parent"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["University", (d: any) => d["Carnegie Parent"]],
          ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
          ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
        ]
      },
      barPadding: 0,
      // groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      x: "IPEDS Race",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }

  else if(hierarchy === "Carnegie") {
  
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race%2CYear,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Enrollment`
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race%2CYear,Carnegie&include=Carnegie:${id}&locale=en&measures=Enrollment`
  
    return {
      data: [dataCP, dataC],
      dataFormat: (resp: any) => {
        const dataCP = resp[0].data;
        const dataC = resp[1].data
      
        const dataTemp = dataC.filter((d: any) => d["Carnegie ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const dataFinal_ = dataCP.concat(dataC);
        const dataFinal = dataFinal_.filter((d: any) => d.Year*1 <= maxYear*1 && d.Year*1 >= minYear*1)
      
        const data = dataFinal.filter((d: any) => d["IPEDS Race ID"] !== "unknown");
        nest()
          .key((d: any) => `${d.Year}_${d["Carnegie"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie"],
      shapeConfig: {
        Bar: {
          label: ""
        },
        fill: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
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
      // groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      x: "IPEDS Race",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }

  else {
  
    const dataU: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race%2CYear,University&include=University:${id}&locale=en&measures=Enrollment`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race%2CYear,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Enrollment`
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_enrollment&drilldowns=IPEDS+Race%2CYear,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Enrollment`
  
    return {
      data: [dataCP, dataC, dataU],
      dataFormat: (resp: any) => {
        const dataCP = resp[0].data;
        const dataC = resp[1].data;
        const dataU = resp[2].data;
      
        const dataTemp = dataU.filter((d: any) => d["University ID"]*1 === id*1);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);
      
        dataCP.forEach((d: any) => {
          d["University"] = d["Carnegie Parent"]
          d["University ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        dataC.forEach((d: any) => {
          d["University"] = d["Carnegie"]
          d["University ID"] = d["Carnegie ID"]
          delete d["Carnegie"]
          delete d["Carnegie ID"]
        })
      
        const dataFinal_ = dataU.concat(dataC, dataCP);
        const dataFinal = dataFinal_.filter((d: any) => d.Year*1 <= maxYear*1 && d.Year*1 >= minYear*1)
      
        const data = dataFinal.filter((d: any) => d["IPEDS Race ID"] !== "unknown");
        nest()
          .key((d: any) => `${d.Year}_${d["University"]}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        return data;
      },
      discrete: "x",
      groupBy: ["University"],
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
          ["University", (d: any) => d["University"]],
          ["Enrolled Students", (d: any) => `${commas(d["Enrollment"])}`],
          ["Share", (d: any) => `${commas(d["share"] * 100)}%`]
        ]
      },
      barPadding: 0,
      // groupPadding: 40,
      type: "BarChart",
      legend: false,
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      },
      x: "IPEDS Race",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      xSort: (a: any, b: any) => b[measure] - a[measure]
    }
  }

};

export default viz;
