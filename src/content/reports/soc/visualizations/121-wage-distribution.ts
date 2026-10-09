// Converted from legacy canon_cms_section_visualization #121 "section wage-distribution" (profile: soc) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {colorGrey, colorHighlight, id, hierarchy} = variables;
  const {max, nest, sum} = libs.d3;
  const {abbreviate, commas} = formatters;

  const optionName = swap("{{[[gender-options]]}}");
  const options = swap("[[gender-options]]") // sex0, sex1, sex2

  const optionSelected = options === "sex1" ? "&Gender=1" : options === "sex2" ? "&Gender=2" : ""

  let dataURL: any = [
    `/api/data?drilldowns=Year,Gender,Wage Bin&measures=Record Count,Total Population,Total Population MOE Appx&Workforce Status=true&Record Count>=5&${hierarchy}=${id}${optionSelected}`,
    //  `/api/data?PUMS%20Occupation=${ id }&measure=Total%20Population,Total%20Population%20MOE%20Appx,Record%20Count&drilldowns=Wage%20Bin&Workforce%20Status=true&Record%20Count>=5`,
    `/api/data?drilldowns=Year,Gender,Wage Bin&measures=Record Count,Total Population,Total Population MOE Appx&Workforce Status=true&Geography=01000US&Record Count>=5${optionSelected}`
    // "/api/data?Geography=01000US&measure=Total%20Population,Total%20Population%20MOE%20Appx,Record%20Count&drilldowns=Wage%20Bin&Workforce%20Status=true&Record%20Count>=5"
    ];
  
  let data1: any = ``

  const measure: string = "Total Population";

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      const latestYear = max(resp[0].data, (d: any) => d["ID Year"]);
      const data = resp[1].data.map((d: any) => Object.assign({}, d, {title: "USA"}))
        .concat(resp[0].data.map((d: any) => Object.assign({}, d, {title: d[`${hierarchy}`]})))
        .filter((d: any) => d["ID Year"] <= latestYear);
      libs.d3.nest()
        .key((d: any) => `${d.Year}_${d.title}`)
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          group.values.forEach((d: any) => d.share = d[measure] / total);
        });
      return data;
    },
    groupBy: "title",
    shapeConfig: {
      fill: (d: any) => d.title === "USA" ? colorGrey : colorHighlight
    },
    time: "Year",
    tooltipConfig: {
      tbody: (d: any) => {
        let customTooltip: any = [];
        options !== "sex0" ?
          customTooltip = [
            ["Year", d.Year],
            ["Gender", optionName],
            ["Wage Bin", d["Wage Bin"]],
            ["People in Workforce", commas(d[measure])],
            ["Margin of Error", `± ${commas(d[`${measure} MOE Appx`])}`],
            ["Share", `${abbreviate(d.share * 100)}%`]
          ] :
          customTooltip = [
            ["Year", d.Year],
            ["Wage Bin", d["Wage Bin"]],
            ["People in Workforce", commas(d[measure])],
            ["Margin of Error", `± ${commas(d[`${measure} MOE Appx`])}`],
            ["Share", `${abbreviate(d.share * 100)}%`]
          ]
        return customTooltip;
      },
    },
    legend: false,
    type: "BarChart",
    x: "Wage Bin",
    xConfig: {
      title: "Average Salary",
      labelRotation: true
    },
    xSort: (a: any, b: any) => a["ID Wage Bin"] - b["ID Wage Bin"],
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: "Share"
    }
  }
};

export default viz;
