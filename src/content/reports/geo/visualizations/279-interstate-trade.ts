// Converted from legacy canon_cms_section_visualization #279 "section interstate_trade" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, colorScaleGood, exporterYear, freightIDs, freightYear, id, tesseract} = variables;
  const {abbreviate} = formatters;
  const selector = swap("[[trade-flow-interstate_trade]]");
  const measure = selector.includes("Dollar") ? "Millions Of Dollars" : "Thousands Of Tons";
  const dir = selector.includes("Import") ? "Destination State" : "Origin State";
  const other = selector.includes("Import") ? "Origin State" : "Destination State";

  const url: string = `${tesseract}tesseract/data.jsonrecords?${dir}=${id}&cube=dot_faf&measures=Millions+Of+Dollars,Thousands+Of+Tons&drilldowns=Year,${other}`

  return {
    colorScale: measure,
    colorScaleConfig: {
      color: colorScaleGood,
      axisConfig: {
        tickFormat: (d: any) => measure === "Millions Of Dollars" ? `$${abbreviate(d * 1000000)}` : abbreviate(d * 1000),
        title: measure === "Millions Of Dollars" ? "Trade Value" : "Tonnage"
      }
    },
    data: url,
    dataFormat: (resp: any) => {
      return resp.data.filter((d: any) => !freightIDs.includes(d[`${other} ID`]));
    },
    groupBy: `${other} ID`,
    label: (d: any) => d[other],
    ocean: "transparent",
    projection: "geoAlbersUsa",
    time: "Year",
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
        ["Value", (d: any) => `$${abbreviate(d["Millions Of Dollars"] * 1000000)}`],
        ["Tonnage", (d: any) => `${abbreviate(d["Thousands Of Tons"] * 1000)} tons`]
      ]
    },
    topojson: "/topojson/State.json",
    type: "Geomap"
  }
};

export default viz;
