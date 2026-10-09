// Converted from legacy canon_cms_section_visualization #302 "section incomeawards" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, id, tesseract} = variables;
  const {abbreviate, commas, salary} = formatters;

  const measure: string = "Median Grant Or Scholarship Award";
  const measureEncoded = measure.replace(/\s/g, "%20");

  const {nest, sum} = libs.d3;

  const data: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_sfa_aid&drilldowns=Income+Range,Year,Carnegie+Parent&locale=en&measures=Median+Grant+Or+Scholarship+Award`
  const dataLiving: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_ic_living_expenses&drilldowns=Year,Carnegie+Parent&locale=en&measures=Median+Room+And+Board,Median+Other+Student+Expenses`
  const dataTuition: string = `${tesseract}tesseract/data.jsonrecords?cube=ipeds_tuition&drilldowns=Year,Carnegie+Parent&locale=en&measures=Out+Of+State+Tuition,Books+And+Supplies`

  return {
    data: [data, dataLiving, dataTuition],
    dataFormat: (resp: any) => {
      const data = resp[0].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");

      const dataLiving = resp[1].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD");
      const dataTuition = resp[2].data.filter((d: any) => d["Carnegie Parent ID"] !== "NAD"); 
    
    
      const tempData = data.filter((d: any) => d["Carnegie Parent ID"] === id)
      const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
      const minYear = libs.d3.min(tempData, (d: any) => d.Year)

      const dataTemp = data.filter((d: any) => d["Year"]*1 >= minYear*1 && d["Year"]*1 <= maxYear*1);

        //Add measures
        const livingCostLookup: Record<string, any> = {};
        dataLiving.forEach((d: any) => {
          livingCostLookup[`${d["Year"]}_${d["Carnegie Parent ID"]}`] = d;
        });
      
        const tuitionCostLookup: Record<string, any> = {};
        dataTuition.forEach((d: any) => {
          tuitionCostLookup[`${d["Year"]}_${d["Carnegie Parent ID"]}`] = d;
        });
      
        const dataFinal = dataTemp.map((d: any) => {
          const key: string = `${d["Year"]}_${d["Carnegie Parent ID"]}`;
      
          const living = livingCostLookup[key] || {};
          const tuition = tuitionCostLookup[key] || {};
      
          return {
            ...d,
            ...living,
            ...tuition
          };
        });
      
        dataFinal.forEach((d: any) => {
          d["Cost"] = d["Books And Supplies"] + d["Median Other Student Expenses"] + d["Median Room And Board"] + d["Out Of State Tuition"];
          d["Discount"] = d["Median Grant Or Scholarship Award"] / d["Cost"];
        })

        return dataFinal.filter((d: any) => d["Discount"] > 0);
      },
    
    discrete: "x",
    groupBy: ["Carnegie Parent"],
    shapeConfig: {
      Bar: {
        label: ""
      },
      fill: (d: any) => d["Carnegie Parent ID"] == id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Average Financial Aid", (d: any) => `$${commas(d["Median Grant Or Scholarship Award"])}`],
        ["Cost", (d: any) => `$${commas(d["Cost"])}`],
        ["Discount", (d: any) => `${abbreviate(d["Discount"] * 100)}%`]
      ]
    },
    barPadding: 0,
    groupPadding: 40,
    type: "BarChart",
    legend: false,
    y: "Discount",
    yConfig: {
      domain: [0, 1],
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Discount"
    },
    x: "Income Range",
    xConfig: {
      labelRotation: false,
      title: "Income Range"
    },
    xSort: (a: any, b: any) => a["Income Range ID"] - b["Income Range ID"] || (a["Carnegie Parent ID"] > b["Carnegie Parent ID"] ? 1 : -1)
  }
};

export default viz;
