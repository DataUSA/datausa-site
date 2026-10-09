// Converted from legacy canon_cms_section_visualization #414 "section income_distro" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, pumsID, pumsHierarchy, tesseract} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, commas} = formatters;

  const measure: string = "Total Population";

  const dataNation: string = `${tesseract}tesseract/data?cube=pums_5&measures=Total+Population,Record+Count&include=Nation:01000US;Workforce+Status:true&drilldowns=Nation,Year,Wage+Bin&filters=Record+Count.gte.5`
  const dataGeos: string = `${tesseract}tesseract/data?cube=pums_5&measures=Total+Population,Record+Count&include=${pumsHierarchy}:${pumsID};Workforce+Status:true&drilldowns=${pumsHierarchy},Year,Wage+Bin&filters=Record+Count.gte.5`
  const moeNation: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&measures=Total+Population+MOE+Appx&locale=en&parents=false&include=Nation:01000US;Workforce+Status:true`
  const moeGeos: string = `${tesseract}calcs/pums.jsonrecords?cube=pums_5&drilldowns=Year,Wage+Bin&measures=Total+Population+MOE+Appx&locale=en&parents=false&include=${pumsHierarchy}:${pumsID};Workforce+Status:true`


  if(pumsHierarchy !== "Nation"){
    return {
      data: [dataNation, dataGeos, moeNation, moeGeos],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataGeo = resp[1].data;
      
        const dataMoeNation = resp[2].data;
        const dataMoeGeo = resp[3].data;
      
        //Add Moe Nation
        dataNation.forEach((popItem: any) => {
          const matchingMoeItem = dataMoeNation.find((moeItem: any) =>
              moeItem.Year === popItem.Year &&
              moeItem["Wage Bin ID"] === popItem["Wage Bin ID"]
          );
    
          if (matchingMoeItem) {
            popItem["Total Population MOE Appx"] = matchingMoeItem["Total Population MOE Appx"];
          } else {
            popItem["Total Population MOE Appx"] = null;
          }
        });
      
        //Add MOE geos
        dataGeo.forEach((popItem: any) => {
          const matchingMoeItem = dataMoeGeo.find((moeItem: any) =>
              moeItem.Year === popItem.Year &&
              moeItem["Wage Bin ID"] === popItem["Wage Bin ID"]
          );
    
          if (matchingMoeItem) {
            popItem["Total Population MOE Appx"] = matchingMoeItem["Total Population MOE Appx"];
          } else {
            popItem["Total Population MOE Appx"] = null;
          }
        });
      
        const formattedNation = dataNation.map((d: any) => {
          const h: Record<string, any> = { ...d };
          h[pumsHierarchy] = d["Nation"];
          h[`${pumsHierarchy} ID`] = d["Nation ID"];
          delete h["Nation"];
          delete h["Nation ID"];
          return h;
        });
    
        const mergedData: any = [...formattedNation, ...dataGeo];
      
        libs.d3.nest()
          .key((d: any) => `${d.Year}_${d[pumsHierarchy]}`)
          .entries(mergedData)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });

        return mergedData;
      },
      groupBy: pumsHierarchy,
      legendTooltip: {
        tbody: []
      },
      shapeConfig: {
        fill: (d: any) => d[`${pumsHierarchy} ID`] === pumsID ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Wage Bin", (d: any) => d["Wage Bin"]],
          ["People in Workforce", (d: any) => commas(d[measure])],
          ["Margin of Error", (d: any) => `± ${commas(d[`${measure} MOE Appx`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "Wage Bin",
      xConfig: {
        labelRotation: false,
        title: "Average Salary"
      },
      xSort: (a: any, b: any) => a["Wage Bin ID"] - b["Wage Bin ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
  else{
    return {
      data: [dataNation, moeNation],
      dataFormat: (resp: any) => {
        const dataNation = resp[0].data;
        const dataMoeNation = resp[1].data;
      
        //Add Moe Nation
        dataNation.forEach((popItem: any) => {
          const matchingMoeItem = dataMoeNation.find((moeItem: any) =>
              moeItem.Year === popItem.Year &&
              moeItem["Wage Bin ID"] === popItem["Wage Bin ID"]
          );
    
          if (matchingMoeItem) {
            popItem["Total Population MOE Appx"] = matchingMoeItem["Total Population MOE Appx"];
          } else {
            popItem["Total Population MOE Appx"] = null;
          }
        });
      
        libs.d3.nest()
          .key((d: any) => `${d.Year}_${d[pumsHierarchy]}`)
          .entries(dataNation)
          .forEach((group: any) => {
            const total = sum(group.values, (d: any) => d[measure]);
            group.values.forEach((d: any) => d.share = d[measure] / total);
          });
        
        return dataNation;
      },
      groupBy: pumsHierarchy,
      legendTooltip: {
        tbody: []
      },
      shapeConfig: {
        fill: (d: any) => d[`${pumsHierarchy} ID`] === pumsID ? colorHighlight : colorGrey
      },
      time: "Year",
      tooltipConfig: {
        tbody: [
          ["Year", (d: any) => d.Year],
          ["Wage Bin", (d: any) => d["Wage Bin"]],
          ["People in Workforce", (d: any) => commas(d[measure])],
          ["Margin of Error", (d: any) => `± ${commas(d[`${measure} MOE Appx`])}`],
          ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
        ]
      },
      type: "BarChart",
      x: "Wage Bin",
      xConfig: {
        labelRotation: false,
        title: "Average Salary"
      },
      xSort: (a: any, b: any) => a["Wage Bin ID"] - b["Wage Bin ID"],
      y: "share",
      yConfig: {
        tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
        title: "Share"
      }
    }
  }
};

export default viz;
