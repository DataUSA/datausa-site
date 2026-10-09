// Converted from legacy canon_cms_section_visualization #409 "section household_income" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, id, tesseract, hierarchy} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket} = formatters;

  const measure: string = "Household Income";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const dataNation: string = `${tesseract}tesseract/data?cube=acs_yg_household_income_5&measures=Household+Income,Household+Income+Moe&include=Nation:01000US&drilldowns=Nation,Year,Household+Income+Bucket`
  const dataGeos: string = `${tesseract}tesseract/data?cube=acs_yg_household_income_5&measures=Household+Income,Household+Income+Moe&include=${hierarchy}:${id}&drilldowns=${hierarchy},Year,Household+Income+Bucket`

  if(hierarchy !== "Nation"){
    return {
      data: [dataNation, dataGeos],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataGeo = resp[1].data;
      
        const tempData = dataGeo.filter((d: any) => d[`${hierarchy} ID`] === id);
        const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
        const minYear = libs.d3.min(tempData, (d: any) => d.Year)

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
        
        return mergedData.filter((d: any) => d.Year*1 <= maxYear*1 && d.Year*1 >= minYear*1);
      },
      groupBy: hierarchy,
      shapeConfig: {
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey
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
      x: "Household Income Bucket",
      xConfig: {
        labelRotation: false,
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a["Household Income Bucket ID"] - b["Household Income Bucket ID"],
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
        fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey
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
      x: "Household Income Bucket",
      xConfig: {
        labelRotation: false,
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a["Household Income Bucket ID"] - b["Household Income Bucket ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }

};

export default viz;
