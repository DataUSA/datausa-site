// Converted from legacy canon_cms_section_visualization #242 "section wage-ranking" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  let dataFinal: any;
  const {hierarchy, id, colorGrey, colorHighlight, lastYearEmploymentLocation} = variables; 
  const {abbreviate, growthPct, commas, salary} = formatters;
  const {nest, sum} = libs.d3;

  const measure: string = "Average Wage";

  const dataURL: string = `/api/data?drilldowns=${hierarchy},Year&measures=${measure},${measure} Appx MOE&Workforce Status=true&Record Count>=5`
  const dataTarget: string = `/api/data?drilldowns=Year&measures=Average Wage&Workforce Status=true`

  //const data = resp.data.filter((d: any) => d["ID Year"] === rankingLatestYear);

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
    
      const occupationData = resp.data.filter((d: any) => d[`ID ${hierarchy}`] === id);
      const rankingLatestYear = Math.max(...occupationData.map((d: any) => d["ID Year"]));
    
      const data: any = []
      //const data_ = resp.data.filter((d: any) => d["ID Year"]*1 <= 2020*1)
      const data_ = resp.data.filter((d: any) => d["ID Year"]*1 === rankingLatestYear)
      nest()
        .key((d: any) => d.Year)
        .entries(data_)
        .forEach((group: any) => {

          group.values.sort((a: any, b: any) => b["Average Wage"] - a["Average Wage"])
          group.values.forEach((d: any, i: any) => {
            d["Ranking"] = i + 1
            d["Shape"] = "Bar"
          });
         // console.log(group.values)
          const rank = group.values.find((d: any) => d[`ID ${hierarchy}`] === id)["Ranking"]
       
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
          return index === dataFinal.findIndex((d: any) => obj[`ID ${hierarchy}`] === d[`ID ${hierarchy}`] && obj["ID Year"] === d["ID Year"]);
        });

        return dataFinal_
    },
    discrete: "y",
    groupBy: `ID ${hierarchy}`,
    label: (d: any) => d["Type ID"] === 99 ? "" : String(d[`${hierarchy}`]),
    shapeConfig: {
      fill: (d: any) => d[`ID ${hierarchy}`] === id ? colorHighlight : colorGrey,
    },
    time: "Year",
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
          customTooltip = [
            ["Year", d["Year"]],
            ["Rank", `#${d["Ranking"]}`],
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
      tickFormat: (d: any) => {
        return d["Type ID"] === 99 ? "..." : `#${d}`;
    },
    },
    ySort: (a: any, b: any) => b["Ranking"] - a["Ranking"],
  };
};

export default viz;
