// Converted from legacy canon_cms_section_visualization #370 "section veteran" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, id, hierarchy, tesseract} = variables;
  const {abbreviate, commas} = formatters;
  const {max, nest, sum, min} = libs.d3;

  const dataNation: string = `${tesseract}tesseract/data?cube=acs_ygv_veterans_5&include=Nation:01000US&measures=Veterans,Veterans+Moe&drilldowns=Period+of+Service,Year,Nation`
  const dataGeo: string = `${tesseract}tesseract/data?cube=acs_ygv_veterans_5&include=${hierarchy}:${id}&measures=Veterans,Veterans+Moe&drilldowns=Period+of+Service,Year,${hierarchy}`

  if(hierarchy !== "Nation"){
    return {
      data: [dataNation, dataGeo],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataGeo = resp[1].data;
      
        dataNation.forEach((d: any) => {
          d["Geo"] = d["Nation"]
          d["Geo ID"] = d["Nation ID"]
        })
      
        dataGeo.forEach((d: any) => {
          d["Geo"] = d[hierarchy]
          d["Geo ID"] = d[`${hierarchy} ID`]
        })
      
        const result = dataNation.concat(dataGeo);
      
        const tempData = dataGeo.filter((d: any) => d[`${hierarchy} ID`] === id);
        const maxYear = max(tempData, (d: any) => d["Year"]);
        const minYear = min(tempData, (d: any) => d["Year"]);
  
        const data = result.filter((d: any) => d["Period of Service ID"]*1 !== 5 && d["Year"]*1 <= maxYear && d["Year"]*1 >= minYear);
  
        nest()
          .key((d: any) => `${d[`Geo ID`]}_${d.Year}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d.Veterans);
            group.values.forEach((d: any) => d.share = d.Veterans / total);
          });
        return data;
      },
      groupBy: "Geo",
      groupPadding: 20,
      shapeConfig: {
        fill: (d: any) => d[`Geo ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["People", (d: any) => commas(d.Veterans)],
          ["Margin of Error", (d: any) => `± ${commas(Math.round(d["Veterans Moe"]))}`]
        ]
      },
      type: "BarChart",
      x: "Period of Service",
      xConfig: {
        title: "Conflict"
      },
      xSort: (a: any, b: any) => b["Period of Service ID"] - a["Period of Service ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
  else{
    return {
      data: dataNation,
      dataFormat: (resp: any) => {
        const dataNation = resp.data;
  
        dataNation.forEach((d: any) => {
          d["Geo"] = d["Nation"]
          d["Geo ID"] = d["Nation ID"]
        })
  
        const maxYear = max(dataNation, (d: any) => d["Year"]);
  
        const data = dataNation.filter((d: any) => d["Period of Service ID"]*1 !== 5 && d["Year"]*1 <= maxYear);
  
        nest()
          .key((d: any) => `${d[`Geo ID`]}_${d.Year}`)
          .entries(data)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d.Veterans);
            group.values.forEach((d: any) => d.share = d.Veterans / total);
          });
        return data;
      },
      groupBy: "Geo",
      groupPadding: 20,
      shapeConfig: {
        fill: (d: any) => d[`Geo ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["People", (d: any) => commas(d.Veterans)],
          ["Margin of Error", (d: any) => `± ${commas(Math.round(d["Veterans Moe"]))}`]
        ]
      },
      type: "BarChart",
      x: "Period of Service",
      xConfig: {
        title: "Conflict"
      },
      xSort: (a: any, b: any) => b["Period of Service ID"] - a["Period of Service ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }



};

export default viz;
