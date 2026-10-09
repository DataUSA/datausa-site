// Converted from legacy canon_cms_section_visualization #413 "section property" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {colorGrey, colorHighlight, id, hierarchy, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, bucket} = formatters

  const measureSelected = swap("[[propertyTaxesValue]]") // propertyTaxes, propertyValue

  const measure = measureSelected === "propertyTaxes" ? "Real Estate Taxes by Mortgage" : "Property Value by Bucket"
  const drilldown = measureSelected === "propertyTaxes" ? "Real Estate Taxes Paid" : "Value Bucket"
  const cube = measureSelected === "propertyTaxes" ? "acs_ygmt_mortgage_status_by_real_estate_taxes_5" : "acs_ygo_housing_value_bucket_5"

  const dataNation: string = `${tesseract}tesseract/data?cube=${cube}&measures=Year,${measure},${measure}+Moe&include=Nation:01000US&drilldowns=Year,Nation,${drilldown}`
  const dataGeos: string = `${tesseract}tesseract/data?cube=${cube}&measures=Year,${measure},${measure}+Moe&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy},${drilldown}`

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
        
        return mergedData.filter((d: any) => d["Year"]*1 <= maxYear*1 && d["Year"]*1 >= minYear*1);
      },
      groupBy: hierarchy,
      groupPadding: 2,
      legendTooltip: {
        tbody: []
      },
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
      x: drilldown,
      xConfig: {
        labelRotation: true,
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a[`${drilldown} ID`] - b[`${drilldown} ID`],
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
      groupPadding: 20,
      legendTooltip: {
        tbody: []
      },
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
      x: drilldown,
      xConfig: {
        labelRotation: true,
        tickFormat: (d: any) => bucket(d)
      },
      xSort: (a: any, b: any) => a[`${drilldown} ID`] - b[`${drilldown} ID`],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
};

export default viz;
