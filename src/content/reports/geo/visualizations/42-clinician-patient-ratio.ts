// Converted from legacy canon_cms_section_visualization #42 "section clinician_patient_ratio" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {formatters, swap}) => {
  const {colorGrey, colorHighlight, id, hierarchy, stateDataID, name1, tesseract, stateNeighbors, neighborIds} = variables;

  const {commas, list} = formatters;
  const geos: any = [];
  for (let i = 0; i < 3; i++) {
    const pID = variables[`provider${i + 1}GeoID`];
    if (pID) geos.push(pID);
  }
  const Geography = geos.map((d: any) => `${d}:neighbors,${d}`).join(",");
  const measure = variables[swap("[[provider-clinician_patient_ratio]]")];

  const multiple = (d: any) => /\s|\-/g.test(d);
  const auxVar =  hierarchy === "County" ? "County" : "State"
  const auxVar2 =  hierarchy === "County" ? id : stateDataID

  const dataURL = hierarchy === "County" ? `${tesseract}tesseract/data?cube=county_health_ranking&measures=${measure}&include=County:${id},${neighborIds}&drilldowns=County,Year`
                                         : `${tesseract}tesseract/data?cube=county_health_ranking&measures=${measure}&include=State:${stateDataID},${stateNeighbors}&drilldowns=State,Year`

  return {
    data: dataURL,
    dataFormat: (resp: any) => {
      return resp.data;
    },
    discrete: "x",
    groupBy: [auxVar],
    legend: true,
    legendConfig: {
      label: (d: any) => d[`${auxVar} ID`] === auxVar2 ? d[auxVar] : "Neighboring Geographies",
    },
    legendTooltip: {
      title: (d: any) => d[`${auxVar} ID`] === auxVar2 ? d[auxVar] : "Neighboring Geographies",
    },
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          fontColor: (d: any) => d[`${auxVar} ID`] === auxVar2 ? colorHighlight : colorGrey,
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12,
          fontStroke: "#E9E9E9",
          fontStrokeWidth: 0.1
        },
        stroke: (d: any) => d[`${auxVar} ID`] === auxVar2 ? colorHighlight : colorGrey
      },
    },
    tooltipConfig: {
      title: (d: any) => d[auxVar],
      tbody: [
        [measure, (d: any) => `${commas(d[measure])} to 1`],
        ["Report Year", (d: any) => d.Year],
      ]
    },
    type: "LinePlot",
    x: "Year",
    y: measure,
    yConfig: {
      tickFormat: (d: any) => `${commas(d)} to 1`,
      title: measure
    }
  }
};

export default viz;
