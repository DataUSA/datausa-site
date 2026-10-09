// Converted from legacy canon_cms_section_visualization #411 "section commute_time" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket} = formatters;

  const measure: string = "Commuter Population";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataNation: string = `${tesseract}tesseract/data?cube=acs_ygt_travel_time_to_work_5&measures=Commuter+Population,Commuter+Population+Moe&include=Nation:01000US&drilldowns=Nation,Year,Travel+Time`
  const dataGeos: string = `${tesseract}tesseract/data?cube=acs_ygt_travel_time_to_work_5&measures=Commuter+Population,Commuter+Population+Moe&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year,Travel+Time`


  if(hierarchy !== "Nation"){
    return {
      data: [dataNation, dataGeos],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataGeo = resp[1].data;
      
        const tempData = dataGeo.filter((d: any) => d[`${hierarchy} ID`] === id);
        const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
      
        const formattedNation = dataNation.map((d: any) => {
          const h: Record<string, any> = { ...d };
          h[hierarchy] = d["Nation"];
          h[`${hierarchy} ID`] = d["Nation ID"];
          delete h["Nation"];
          delete h["Nation ID"];
          return h;
        });
      
        const mergedData: any = [...formattedNation, ...dataGeo];
      
        nest().key((d: any) => `${d.Year}_${d[hierarchy]}`)
          .entries(mergedData)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        
        return mergedData.filter((d: any) => d.Year === maxYear);
      },
      groupBy: hierarchy,
      shapeConfig: {
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Households", (d: any) => abbreviate(d[measure])],
          ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "Travel Time",
      xConfig: {
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a["Travel Time ID"] - b["Travel Time ID"],
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
  
        nest().key((d: any) => `${d.Year}_${d[hierarchy]}`)
        .entries(dataNation)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
        
        return dataNation;
      },
      groupBy: hierarchy,
      shapeConfig: {
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey,
        label: false
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Households", (d: any) => abbreviate(d[measure])],
          ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "Travel Time",
      xConfig: {
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a["Travel Time ID"] - b["Travel Time ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
};

export default viz;
