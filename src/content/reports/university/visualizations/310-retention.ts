// Converted from legacy canon_cms_section_visualization #310 "section retention" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  let dataC: any; let dataCP: any; let dataU: any;
  const {lengthRetentionRate, colorGrey, colorHighlight, id, isCarnegieParent, similarID, tesseract, carnegieSimilarIDs, idCarnegieParent, hierarchy, idCarnegie} = variables;
  const {abbreviate, commas, salary} = formatters;

  const {nest, sum} = libs.d3;
  const measure: string = "Full Time Retention Rate";
  const measureEncoded = measure.replace(/\s/g, "%20");
  const lengthTempData = 1;

  if (isCarnegieParent) {
    return {
      data: `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&drilldowns=Carnegie+Parent,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`,
      dataFormat: (resp: any) => {
        let dataC = resp.data;
        return dataC.filter((d: any) => d[measure] !== null);
      },
      discrete: "x",
      groupBy: ["Carnegie Parent"],
      lineMarkers: true,
      lineMarkerConfig: {
        fill: (d: any) => {
        	return d.data["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
        }
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie Parent ID"] === id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Full Time Retention Rate", (d: any) => `${d["Full Time Retention Rate"]}%`]
        ]
      },
      barPadding: 0,
      type: "LinePlot",
      legend: false,
      y: measure,
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d)}%`,
        title: "Full-Time Retention Rate"
      },
      x: "Year",
      xConfig: {
        labelRotation: false,
        title: ""
      },
      xSort: (a: any, b: any) => a["Year"] - b["Year"]
    }
  }

  else if (hierarchy === "Carnegie") {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=Carnegie:${id},${similarIDs}&drilldowns=Carnegie,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Carnegie+Parent,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`
  
    return {
      data: [dataC, dataCP],
      dataFormat: (resp: any) => {
        let dataC = resp[0].data.filter((d: any) => d["Carnegie ID"] > 0);
        let dataCP = resp[1].data;

        dataC.forEach((d: any) => {
          d["Carnegie ID"] = `${d["Carnegie ID"]}`
        })
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = `${d["Carnegie Parent ID"]}`
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const data = dataC.concat(dataCP)

        return data.filter((d: any) => d[measure] !== null);
      },
      groupBy: ["Carnegie"],
      lineMarkers: true,
      lineMarkerConfig: {
        fill: (d: any) => {
        	return d.data["Carnegie ID"] === id ? colorHighlight : colorGrey
        }
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie ID"] === id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Full Time Retention Rate", (d: any) => `${d["Full Time Retention Rate"]}%`]
        ]
      },
      barPadding: 0,
      // groupPadding: 40,
      type: "LinePlot",
      legend: false,
      y: measure,
      yConfig: {
     //   tickFormat: (d: any) => `${abbreviate(d)}%`,
        title: "Full-Time Retention Rate"
      },
      x: "Year",
      xConfig: {
        labelRotation: false,
        title: ""
      },
      xSort: (a: any, b: any) => a["Year"] - b["Year"]
    }
  }

  else {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    dataU = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=University:${id},${similarIDs}&drilldowns=University,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`
    dataC = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=Carnegie:${idCarnegie}&drilldowns=Carnegie,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`
    dataCP = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_retention_rates&include=Carnegie+Parent:${idCarnegieParent}&drilldowns=Carnegie+Parent,Year&locale=en&measures=Full+Time+Retention+Rate%2CPart+Time+Retention+Rate`

    return {
      data: [dataC, dataCP, dataU],
      dataFormat: (resp: any) => {
        let dataC = resp[0].data;
        let dataCP = resp[1].data;
        let dataU = resp[2].data;
      
        const dataTemp = dataU.filter((d: any) => d["University ID"]*1 === id*1 && d["Full Time Retention Rate"] !== null);
        const maxYear = libs.d3.max(dataTemp, (d: any) => d.Year);
        const minYear = libs.d3.min(dataTemp, (d: any) => d.Year);

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
      
        const data = dataU.concat(dataC, dataCP).filter((d: any) => d.Year*1 >= minYear && d.Year*1 <= maxYear)

        return {
          data: data.filter((d: any) => d[measure] !== null && d["University ID"] !== "NAD"),
        }
      },
      groupBy: ["University"],
      lineMarkers: true,
      lineMarkerConfig: {
        fill: (d: any) => {
        	return d.data["University ID"] === id ? colorHighlight : colorGrey
        }
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["University ID"] === id ? colorHighlight : colorGrey
        },
        Bar: {
          fill: (d: any) => d["University ID"] === id ? colorHighlight : colorGrey
        }
      },
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Full Time Retention Rate", (d: any) => `${d["Full Time Retention Rate"]}%`]
        ]
      },
      legend: false,
      type: lengthRetentionRate === 1 ? "BarChart" : "LinePlot",
      y: measure,
      yConfig: {
        title: "Full-Time Retention Rate"
      },
      x: "Year",
      xConfig: {
        labelRotation: false,
        title: ""
      },
    }
  }

};

export default viz;
