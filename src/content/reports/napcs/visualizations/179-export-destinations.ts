// Converted from legacy canon_cms_section_visualization #179 "section export-destinations" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorHighlight, exporterYear, id, tesseract, sctg} = variables;
  const {dollar} = formatters;
  const state = swap("[[export-dest-export-destinations]]").slice(5);

  //const url = `/api/data?SCTG2=${id}&measures=Millions%20Of%20Dollars&Origin%20State=${state}&drilldowns=Destination%20State`;

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?Origin State=${state}&cube=dot_faf&SCTG2=${sctg}&measures=Millions Of Dollars&drilldowns=Destination State,Year`

  return {
    colorScale: "Millions Of Dollars",
    colorScaleConfig: {
      axisConfig: {
        tickFormat: (d: any) => dollar(d * 1000000)
      }
    },
    data: dataURL,
    dataFormat: (resp: any) => {
      return resp.data.filter((d: any) => d["Destination State ID"] !== state);
    },
    groupBy: "Destination State ID",
    label: (d: any) => d["Destination State"],
    ocean: "transparent",
    projection: "geoAlbersUsa",
    shapeConfig: {
      Path: {
        fillOpacity: (d: any) => d.id === state ? 0 : 0.75,
        strokeOpacity: (d: any) => d.id === state ? 0.25 : 1
      }
    },
    time: "Year",
    timelineConfig: {
      shapeConfig: {
        labelConfig: {
          fontColor(d: any) {
            const n = parseInt(d.text, 10);
            return isNaN(n) || n <= exporterYear ? "#888" : colorHighlight;
          },
        }
      }
    },
    timeFilter: (d: any) => d.Year == exporterYear,
    tooltipConfig: {
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Value", (d: any) => dollar(d["Millions Of Dollars"] * 1000000)]
      ]
    },
    topojson: "/topojson/State.json",
    type: "Geomap"
  }
};

export default viz;
