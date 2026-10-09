// Converted from legacy canon_cms_section_visualization #323 "section endowment" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {id, colorHighlight, colorGrey, tesseract, hierarchy, carnegieSimilarIDs, idCarnegieParent, similarID, idCarnegie} = variables;
  const {abbreviate} = formatters;
  const {nest, sum} = libs.d3;

  if (hierarchy === "Carnegie") {
  
    const similarIDs = carnegieSimilarIDs[id]["ids"]
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year%2CCarnegie&include=Carnegie:${id},${similarIDs}&locale=en&measures=Median+Endowment+Value`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year%2CCarnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Endowment+Value`

    return {
      //data: `/api/data?Carnegie=${id}:similar,${id},${id}:parents&measures=Median Endowment Value`,
      data: [dataC, dataCP],
      dataFormat: (resp: any) => {
        let dataC = resp[0].data;
        let dataCP = resp[1].data;
      
        dataCP.forEach((d: any) => {
          d["Carnegie"] = d["Carnegie Parent"]
          d["Carnegie ID"] = d["Carnegie Parent ID"]
          delete d["Carnegie Parent"]
          delete d["Carnegie Parent ID"]
        })
      
        const data = dataC.concat(dataCP)
      
        //const data = resp.data;
        nest()
          .key((d: any) => `${d.Year}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d["Median Endowment Value"]);
            group.values.forEach((d: any) => d.share = d["Median Endowment Value"] / total);
          });
        return data;
      },
      discrete: "x",
      groupBy: ["Carnegie"],
      legendConfig: {
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      groupPadding: 40,
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Expenditure", (d: any) => `$${abbreviate(d["Median Endowment Value"])}`]
        ]
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["Carnegie ID"] == id ? colorHighlight : colorGrey
        }
      },
      legend: false,
      x: "Year",
      y: "Median Endowment Value",
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`
      },
      type: "LinePlot"
    }
  }

  else {
  
    const similarIDArray = similarID.split(",");
    const similarIDs = similarIDArray.slice(0, 5);
  
    const dataU: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year,University&include=University:${id},${similarIDs}&locale=en&measures=Median+Endowment+Value`
    const dataC: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year%2CCarnegie&include=Carnegie:${idCarnegie}&locale=en&measures=Median+Endowment+Value`
    const dataCP: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_finance_financials&drilldowns=Year%2CCarnegie+Parent&include=Carnegie+Parent:${idCarnegieParent}&locale=en&measures=Median+Endowment+Value`
  
    return {
      //data: `/api/data?University=${id}:similar,${id},${id}:parents&measures=Median Endowment Value`,
      data: [dataU, dataC, dataCP],
      dataFormat: (resp: any) => {
        let dataU = resp[0].data;
        let dataC = resp[1].data;
        let dataCP = resp[2].data;
      
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
      
        const data = dataU.concat(dataC, dataCP)
      
        //const data = resp.data;
        nest()
          .key((d: any) => `${d.Year}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d["Median Endowment Value"]);
            group.values.forEach((d: any) => d.share = d["Median Endowment Value"] / total);
          });
        return data;
      },
      discrete: "x",
      groupBy: ["University"],
      legendConfig: {
        shapeConfig: {
          // backgroundImage: (d: any) => iconSector[d["ID Sector"]]
        }
      },
      groupPadding: 40,
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Expenditure", (d: any) => `$${abbreviate(d["Median Endowment Value"])}`]
        ]
      },
      shapeConfig: {
        Line: {
          stroke: (d: any) => d["University ID"] == id ? colorHighlight : colorGrey
        }
      },
      legend: false,
      x: "Year",
      y: "Median Endowment Value",
      yConfig: {
        tickFormat: (d: any) => `$${abbreviate(d)}`
      },
      type: "LinePlot"
    }
  }

};

export default viz;
