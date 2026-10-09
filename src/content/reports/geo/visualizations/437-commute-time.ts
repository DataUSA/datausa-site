// Converted from legacy canon_cms_section_visualization #437 "section commute_time" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, neighborsList, similarHierarchy, similarID, resultSimilar} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, salary} = formatters;

  const measure: string = "Average Commute Time";
  const neighbors = hierarchy === "Place" ? "" : `,${neighborsList}`
  const cube: string = "acs_ygt_mean_transportation_time_to_work_5"

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy}&locale=en&measures=${measure}`

  //Crear diferentes URL según la cantidad de hierarchies diferentes
  const baseURL: string = `${tesseract}tesseract/data.jsonrecords`;

  //URL para hierarchies similares
  const dataSimilarURLs = Object.entries(resultSimilar)
    .filter(([key]: any) => /^similarID\d+$/.test(key))
    .map(([key]: any) => {
      const index = key.replace("similarID", ""); // extrae el número
      const ids = resultSimilar[key]; // string separado por comas
      const hierarchy = resultSimilar[`similarHierarchy${index}`];
    
      if (!hierarchy) return null; // evitar entradas inválidas

      const drilldowns: string = `Year,${hierarchy}`;
      const params = new URLSearchParams({
        drilldowns,
        measures: `${measure}`,
        cube,
        include: `${hierarchy}:${ids}`
      });

      return `${baseURL}?${params.toString()}`;
    })
    .filter(Boolean);

  const similarHierarchies = resultSimilar.similarHierarchiesArray;

  return {
    data: [dataURL, ...dataSimilarURLs],
    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataSimilarArrays = resp.slice(1).map((r: any) => r.data)

      similarHierarchies.forEach((simHier: any, i: any) => {
        const dataSimilar = dataSimilarArrays[i];
        if (!Array.isArray(dataSimilar)) return;
        dataSimilar.forEach((d: any) => {
          if (d[simHier] !== undefined && d[`${simHier} ID`] !== undefined) {
            d[hierarchy] = d[simHier];
            d[`${hierarchy} ID`] = d[`${simHier} ID`];
    
            delete d[simHier];
            delete d[`${simHier} ID`];
          }
        });
      });
      
      const dataFinal: any = [...dataID, ...dataSimilarArrays.flat()]

      return dataFinal.filter((d: any) => d[hierarchy]);
    },
    discrete: "x",
    groupBy: `${hierarchy}`,
    height: 200,
    shapeConfig: {
      Line: {
        stroke: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey
      }
    },
    time: "Year",
    timeline: false,
    tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        [measure, (d: any) => `${abbreviate(d[measure])} minutes`]
      ]
    },
    legend: true,
    legendConfig: {
      label: (d: any) => d[`${hierarchy} ID`] === id ? "Profile" : "Parents and Neighbors"
    },
    legendTooltip: {
      title: (d: any) => d[`${hierarchy} ID`] === id ? "Profile" : "Parents and Neighbors"
    },
    type: "LinePlot",
    x: "Year",
    y: measure,
    yConfig: {
      tickFormat: (d: any) => `$${abbreviate(d)}`,
      title: "Average (mins)"
    },
  }
};

export default viz;
