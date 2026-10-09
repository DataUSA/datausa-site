// Converted from legacy canon_cms_section_visualization #350 "section wage_ranking" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  let dataFinal: any;
  const {hierarchy, id, name, colorGrey, colorHighlight, lastYearEmploymentLocation, tesseract} = variables; 
  const {abbreviate, growthPct, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=pums_5&drilldowns=${hierarchy},Year&include=Workforce+Status:true&locale=en&measures=Average+Wage`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const data: any = []
      const data_ = resp.data.filter((d: any) => d["Year"]*1 <= lastYearEmploymentLocation*1)
      nest()
        .key((d: any) => d.Year)
        .entries(data_)
        .forEach((group: any) => {

          group.values.sort((a: any, b: any) => b["Average Wage"] - a["Average Wage"])
          group.values.forEach((d: any, i: any) => {
            d["Ranking"] = i + 1
            d["Shape"] = "Bar"
          });

          const rank = group.values.find((d: any) => d["Industry Group ID"] === id)["Ranking"]
       
          if (rank < 5) {
            const lastRanked: Record<string, any> = {
              ...group.values[group.values.length - 1],
              "Type": "Bottom",
              "Type ID": 3,
            };
          
            const fakeBot: Record<string, any> = {
              ...group.values[group.values.length - 2],
              "Average Wage": 0,
              "Type ID": 99,
            };
      
            const neighbors = group.values
              .filter((d: any) => (d["Ranking"] <= rank + 3) && (d["Ranking"] >= rank - 3))
              .map((d: any) => ({
                ...d,
                "Type": "Neighbors",
                "Type ID": 2,
              }));
        
            data.push(([] as any[]).concat(neighbors, fakeBot, lastRanked));

          } else if (rank > group.values[group.values.length-1] - 5) {
          
            const firstRanked: Record<string, any> = {
              ...group.values[0],
              "Type": "Top",
              "Type ID": 1,
            };
      
            const fakeTop: Record<string, any> = {
              ...group.values[1],
              "Average Wage": 0,
              "Type ID": 99,
            };
      
            const neighbors = group.values
              .filter((d: any) => (d["Ranking"] <= rank + 3) && (d["Ranking"] >= rank - 3))
              .map((d: any) => ({
                ...d,
                "Type": "Neighbors",
                "Type ID": 2,
              }));

            data.push(([] as any[]).concat(firstRanked, fakeTop, neighbors))
          
          } 
          else {

            const firstRanked: Record<string, any> = {
              ...group.values[0],
              "Type": "Top",
              "Type ID": 1,
            };
       
            const lastRanked: Record<string, any> = {
              ...group.values[group.values.length - 1],
              "Type": "Bottom",
              "Type ID": 3,
            };
     
            const fakeTop: Record<string, any> = {
              ...group.values[1],
              "Average Wage": 0,
              "Type ID": 99,
            };
   
            const fakeBot: Record<string, any> = {
              ...group.values[group.values.length - 2],
              "Average Wage": 0,
              "Type ID": 99,
            };
        
            const neighbors = group.values
              .filter((d: any) => (d["Ranking"] <= rank + 3) && (d["Ranking"] >= rank - 3))
              .map((d: any) => ({
                ...d,
                "Type": "Neighbors",
                "Type ID": 2,
              }));
          
            if(rank === 5){
              data.push(([] as any[]).concat(firstRanked, neighbors, fakeBot, lastRanked))
            }
            else {
              data.push(([] as any[]).concat(firstRanked, fakeTop, neighbors, fakeBot, lastRanked))
            }
          }
        })

        dataFinal = data.flat()
        const dataFinal_ = dataFinal.filter((obj: any, index: any) => {
          return index === dataFinal.findIndex((d: any) => obj["Industry Group ID"] === d["Industry Group ID"] && obj["Year"] === d["Year"]);
        });

        return dataFinal_
    },
    discrete: "y",
    groupBy: "Industry Group ID",
    label: (d: any) => d["Type ID"] === 99 ? "" : String(d["Industry Group"]),
    shapeConfig: {
      fill: (d: any) => d["Industry Group ID"] === id ? colorHighlight : colorGrey,
    },
    time: "Year",
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
          customTooltip = [
            ["Year", d["Year"]],
            ["Ranking Position", d["Ranking"]],
            ["Average Wage", salary(d["Average Wage"])]
          ] 
        return customTooltip;
      }
    },
    type: "BarChart",
    x: "Average Wage",
    xConfig: {
      title: "",
      tickFormat: (d: any) => salary(d)
    },
    y: "Ranking",
    yConfig: {
      title: "Ranking",
      //tickFormat: (d: any) => d === 2 ? "..." : d,
    },
    ySort: (a: any, b: any) => b["Ranking"] - a["Ranking"],
  };
};

export default viz;
