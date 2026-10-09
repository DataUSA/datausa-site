// Converted from legacy canon_cms_section_visualization #40 "section trade_growth" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, swap}) => {
  const {colorGrey, colorHighlight, freightIDs, freightYear, freightName, id, name1, stateNeighbors, tesseract} = variables;
  const {abbreviate, dollar} = formatters;
  const {max} = libs.d3;
  const {assign} = libs.d3plus;
  const selector = swap("[[trade-flow-trade_growth]]");
  const measure = selector.includes("Dollar") ? "Millions Of Dollars" : "Thousands Of Tons";
  const dir = selector.includes("Import") ? "Destination State" : "Origin State";

  const Geography = freightIDs.map((d: any) => `${d},${d}:neighbors`).join(",");

  let dataURL: string = `${tesseract}tesseract/data.jsonrecords?${dir}=${id},${stateNeighbors}&cube=dot_faf&drilldowns=Year,${dir}&measures=Millions%20Of%20Dollars,Thousands%20Of%20Tons`

  //<tesseract>tesseract/data.jsonrecords?Origin+State=<id>&Year=<freightYear>&cube=dot_faf&drilldowns=Destination+State,Origin State&measures=Millions+Of+Dollars&sort=Millions Of Dollars.desc

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      resp.data.forEach((d: any) => {
        d.timeframe = d["Year"] <= freightYear ? "Past" : "Future";
      });
      const latestYear = max(resp.data, (d: any) => d["Year"] <= freightYear ? d["Year"] : 0);
      const latestData = resp.data.filter((d: any) => d["Year"] === latestYear);
      latestData.forEach((d: any) => {
        const clone = assign({}, d);
        clone.timeframe = "Future";
        resp.data.push(clone);
      });
      return resp.data;
    },
    discrete: "x",
   // time: "Year",
    depth: 2,
    //groupBy: [(d: any) => freightIDs.includes(d[`${dir} ID`]) ? d.Geography : "Neighboring States", dir, "timeframe"],
    groupBy: [dir, 'timeframe'],
    label: (d: any) => {
      if (d[dir] instanceof Array) {
        if (freightIDs.every((f: any) => d[dir].includes(f))) return freightName;
        return "Neighboring States";
      }
      return d.timeframe === "Future" ? `${d[dir]} (Projected)` : d[dir];
    },
    // legendConfig: {
    //   label: (d: any) => d[`ID ${dir}`] === freightId ? d[dir] : "Neighboring States"
    // },
    legendTooltip: {
      title: (d: any) => freightIDs.includes(d[`${dir} ID`]) ? name1 : "Neighboring States",
      tbody: [
        ["Value", (d: any) => dollar(d["Millions Of Dollars"] * 1000000)],
        ["Tonnage", (d: any) => abbreviate(d["Thousands Of Tons"] * 1000)]
      ]
    },
    shapeConfig: {
      Line: {
        strokeDasharray: (d: any) => d.timeframe === "Past" ? "1" : "10 10",
        stroke: (d: any) => freightIDs.includes(d[`${dir} ID`]) ? colorHighlight : colorGrey
      }
    },
    tooltipConfig: {
      title: (d: any) => {
      if (d[dir] instanceof Array) {
        if (freightIDs.every((f: any) => d[dir].includes(f))) return freightName;
        return "Neighboring States";
      }
      return d.timeframe === "Future" ? `${d[dir]} (Projected)` : d[dir];
    },
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Value", (d: any) => dollar(d["Millions Of Dollars"] * 1000000)],
        ["Tonnage", (d: any) => abbreviate(d["Thousands Of Tons"] * 1000)]
      ]
    },
    type: "LinePlot",
    x: "Year",
    y: measure,
    yConfig: {
      tickFormat: (d: any) => measure === "Millions Of Dollars" ? dollar(d * 1000000) : abbreviate(d * 1000)
    }
  }
};

export default viz;
