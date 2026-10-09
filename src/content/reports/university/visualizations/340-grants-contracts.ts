// Converted from legacy canon_cms_section_visualization #340 "section grants_contracts" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {id, colorGrant, tesseract, hierarchy, idCarnegieParent, idCarnegie, carnegieSimilarIDs, similarID} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;


  if (hierarchy === "Carnegie Parent") {

    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&locale=en&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`

    return {
      data: data,
      //`/api/data?University=${id}:similar,${id},${id}:parents&measures=Federal Grants And Contracts,Local Grants And Contracts,State Grants And Contracts`,
      dataFormat: (resp: any) => {
        const data = resp.data.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {"ID Grant": "Federal", "Grant": "Federal Grants And Contracts", "value": d["Federal Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "Local", "Grant": "Local Grants And Contracts", "value": d["Local Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "State", "Grant": "State Grants And Contracts", "value": d["State Grants And Contracts"]}));
          return all;
        }, []);
  
        return data;
      },
      groupBy: ["Grant"],
      label: "",
      legendConfig: {
        label: "",
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      groupPadding: 20,
      tooltipConfig: {
        title: (d: any) => { 
          return `<div>
              <div class='d3plus-tooltip-title-wrapper'>
              <div class="title-without-icon"><span>${d["ID Grant"]}</span></div>
              <div class="subtitle"><span>Grant</span></div>
            </div>`},
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Grants & Contracts", (d: any) => `$${abbreviate(d["value"])}`]
        ]
      },
      shapeConfig: {
        fill: (d: any) => colorGrant[d["ID Grant"].toLowerCase()]
      },
      stacked: true,
      x: "Carnegie Parent",
      y: "value",
      time: "Year",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`,
        title: "Grants & Contracts"
      },
      type: "BarChart"
    }
  }

  else if (hierarchy === "Carnegie") {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&locale=en&include=Carnegie:${id},${similarIDs}&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`
  
    return {
      data: [data, dataCP],
      dataFormat: (resp: any) => {
        const dataC = resp[0].data;
        const dataCP = resp[1].data;
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const dataMerged = dataC.concat(dataCP)
      
        const data = dataMerged.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {"ID Grant": "Federal", "Grant": "Federal Grants And Contracts", "value": d["Federal Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "Local", "Grant": "Local Grants And Contracts", "value": d["Local Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "State", "Grant": "State Grants And Contracts", "value": d["State Grants And Contracts"]}));
          return all;
        }, []);
  
        return data;
      },
      groupBy: ["Grant"],
      label: "",
      legendConfig: {
        label: "",
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      groupPadding: 20,
      tooltipConfig: {
        title: (d: any) => { 
          return `<div>
              <div class='d3plus-tooltip-title-wrapper'>
              <div class="title-without-icon"><span>${d["ID Grant"]}</span></div>
              <div class="subtitle"><span>Grant</span></div>
            </div>`},
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Grants & Contracts", (d: any) => `$${abbreviate(d["value"])}`]
        ]
      },
      shapeConfig: {
        fill: (d: any) => colorGrant[d["ID Grant"].toLowerCase()]
      },
      stacked: true,
      x: "Carnegie",
      y: "value",
      time: "Year",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`,
        title: "Grants & Contracts"
      },
      type: "BarChart"
    }
  }

  else {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,University&locale=en&include=University:${id},${similarIDs}&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,Carnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Federal+Grants+And+Contracts%2CLocal+Grants+And+Contracts%2CState+Grants+And+Contracts`
  
    return {
      data: [data, dataC, dataCP],
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
      
        const dataMerged = dataU.concat(dataC, dataCP)
      
        const data = dataMerged.reduce((all: any, d: any) => {
          all.push(Object.assign({}, d, {"ID Grant": "Federal", "Grant": "Federal Grants And Contracts", "value": d["Federal Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "Local", "Grant": "Local Grants And Contracts", "value": d["Local Grants And Contracts"]}));
          all.push(Object.assign({}, d, {"ID Grant": "State", "Grant": "State Grants And Contracts", "value": d["State Grants And Contracts"]}));
          return all;
        }, []);
  
        return data;
      },
      groupBy: ["Grant"],
      label: "",
      legendConfig: {
        label: "",
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      groupPadding: 20,
      tooltipConfig: {
        title: (d: any) => { 
          return `<div>
              <div class='d3plus-tooltip-title-wrapper'>
              <div class="title-without-icon"><span>${d["ID Grant"]}</span></div>
              <div class="subtitle"><span>Grant</span></div>
            </div>`},
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Grants & Contracts", (d: any) => `$${abbreviate(d["value"])}`]
        ]
      },
      shapeConfig: {
        fill: (d: any) => colorGrant[d["ID Grant"].toLowerCase()]
      },
      stacked: true,
      x: "University",
      y: "value",
      time: "Year",
      xConfig: {
        labelRotation: false,
        title: "University"
      },
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`,
        title: "Grants & Contracts"
      },
      type: "BarChart"
    }
  }

};

export default viz;
