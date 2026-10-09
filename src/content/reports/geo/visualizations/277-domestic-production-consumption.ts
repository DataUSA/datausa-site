// Converted from legacy canon_cms_section_visualization #277 "section domestic_production_consumption" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  let yearValue: any;
  const {colorHighlight, colorScaleDiverging, freightYear, id, tesseract} = variables;
  const {abbreviate, growth} = formatters;
  const {extent, nest, sum} = libs.d3;
  const {merge} = libs.d3plus;

  const selector = swap("[[trade-flow-domestic_trade]]");
  const measure = selector.includes("Dollar") ? "Millions Of Dollars" : "Thousands Of Tons";
  const dir = selector.includes("Import") ? "Destination State" : "Origin State";
  const value = selector.includes("Dollar") ? 1000000 : 1000

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?${dir}=${id}&cube=dot_faf&drilldowns=Year,SCTG2,${dir}&measures=Millions Of Dollars,Thousands Of Tons&locale=en`

  return {
    colorScale: `${measure} Growth`,
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => `${abbreviate(d)}%`,
        title: "1-Year Annual Growth/Decay"
      },
      color: colorScaleDiverging,
      colorMin: "#7B0000",
      colorMid: "#DC9595",
      colorMax: "#004374"
    },
    data: dataURL,
    dataFormat: (resp: any) => {
      const data = resp.data.map((d: any) => Object.assign({}, d));
      const tempData = resp.data.map((d: any) => Object.assign({}, d));
    
      data.forEach((d: any) => {
        yearValue = d["Year"] <= 2018 || d["Year"] == 2023 ? 1 : d["Year"] >= 2025 ? 5 : 2
 
        const s = tempData.find((h: any) => (h["Year"]*1  === d["Year"]*1 - yearValue) && (h["SCTG2 ID"] === d["SCTG2 ID"])) || {};
        d["Value Prev"] = s[measure];
        d[`${measure} Growth`] = ((d[measure] - d["Value Prev"]) / d["Value Prev"])*100
      });
    
      nest()
        .key((d: any) => d["Year"])
        .entries(data)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]) 
          group.values.forEach((d: any) => {
              d["Share"] = (d[measure] / total) * 100
          });
        });
      return data.filter((d: any) => d[`Value Prev`])
    },
    groupBy: "SCTG2",
    shapeConfig: {
      fill: "D3PLUS-COMMON-RESET"
    },
    label: (d: any) => String(d["SCTG2"]),
    sum: measure,
    time: "Year",
    timeline: true,
    timelineConfig: {
      shapeConfig: {
        labelConfig: {
          fontColor(d: any) {
            const n = parseInt(d.text, 10);
            return isNaN(n) || n <= freightYear ? "#888" : colorHighlight;
          },
        }
      }
    },
    timeFilter: (d: any) => d.Year == `${freightYear}`,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Value", (d: any) => `$${abbreviate(d[measure] * value)}`],
        [(d: any) => `1-Year Value ${d[`${measure} Growth`] < 0 ? "Decline" : "Growth"}`, (d: any) => `${abbreviate(d[`${measure} Growth`])}%`],
       // ["Tonnage", (d: any) => abbreviate(d["Thousands Of Tons"] * 1000)],
      //  [(d: any) => `1-Year Tonnage ${d[`Thousands Of Tons Growth`] < 0 ? "Decline" : "Growth"}`, (d: any) => `${abbreviate(d["Thousands Of Tons Growth"])}%`]
      ]
    },
    total: measure,
    totalFormat: (d: any) => `Total: ${measure === "Millions Of Dollars" ? `$${abbreviate(d * 1000000)}` : abbreviate(d * 1000)}`,
    type: "Treemap"
  };


};

export default viz;
