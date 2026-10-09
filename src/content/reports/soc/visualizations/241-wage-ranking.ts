// Converted from legacy canon_cms_section_visualization #241 "section wage-ranking" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {hierarchy, id, colorGrey, colorHighlight} = variables;
  const {abbreviate, growthPct, commas, salary} = formatters;
  const {sum, nest} = libs.d3;

  const measure: string = "Average Wage";

  const dataURL: string = `/api/data?drilldowns=${hierarchy},Year&measures=${measure},${measure} Appx MOE&Workforce Status=true&Record Count>=5`
  const dataTarget: string = `/api/data?drilldowns=Year&measures=Average Wage&Workforce Status=true`

  return {
    data: [dataURL, dataTarget],
    dataFormat: (resp: any) => {
      let data = resp[0].data.map((d: any) => Object.assign({}, d));
      let target = resp[1].data.map((d: any) => Object.assign({}, d));

      target.forEach((d: any) => {
        d[`ID ${hierarchy}`] = "0"
        d[`${hierarchy}`] = "National Average Wage"
      })
    
      let dataFinal_ = data.concat(target)
    
      dataFinal_ = dataFinal_.sort((a: any, b: any) => b[measure] - a[measure])
      nest()
        .key((d: any) => d["Year"])
        .entries(dataFinal_)
        .forEach((group: any) => {
          group.values.forEach((d: any, i: any) => {
            d["Ranking"] = i + 1;
            d["Shape"] = "Bar"
          });
        });
      return dataFinal_
    },
    discrete: "y",
    groupBy: [`ID ${hierarchy}`],
    label: (d: any) => String(d[hierarchy]),
    shape: (d: any) => d.Shape,
    shapeConfig: {
      fill: (d: any) => d[`ID ${hierarchy}`] === id ? colorHighlight :  d[`ID ${hierarchy}`]*1 === 0 ? "#124a8a" :  colorGrey,
    },
    time: "Year",
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        d[`ID ${hierarchy}`]*1 !== 0 ?
          customTooltip = [
            ["Year", d["Year"]],
            ["Ranking Position", d["Ranking"]],
            ["Average Wage", salary(d["Average Wage"])]
          ] :
           customTooltip = [
            ["Year", d["Year"]],
            ["National Average Wage", salary(d["Average Wage"])],
          ]
        return customTooltip;
      }
    },
    type: "BarChart",
    x: measure,
    xConfig: {
      title: "Average Wage",
      tickFormat: (d: any) => salary(d)
    },
    y: "Ranking",
    yConfig: {
      title: "Ranking",
      tickFormat:  (d: any) => `#${d}`,
    },
    ySort: (a: any, b: any) => b["Ranking"] - a["Ranking"],
 
  };
};

export default viz;
