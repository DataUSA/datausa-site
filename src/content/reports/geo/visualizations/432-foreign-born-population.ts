// Converted from legacy canon_cms_section_visualization #432 "section foreign_born_population" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, similarHierarchy, similarID} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate} = formatters;

  const measure: string = "Foreign-Born Citizens";
  const share: string = "Foreign-Born %";

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygf_place_of_birth_for_foreign_born_5&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy}&locale=en&measures=Foreign-Born+Citizens`
  const dataSimilarNation: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygf_place_of_birth_for_foreign_born_5&include=${similarHierarchy}:${similarID}&drilldowns=Year,${similarHierarchy}&locale=en&measures=Foreign-Born+Citizens`

  const dataPopURL: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy}&locale=en&measures=Citizenship+Status`
  const dataSimilarPop: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${similarHierarchy}:${similarID}&drilldowns=Year,${similarHierarchy}&locale=en&measures=Citizenship+Status`

  function mergePopulation(datasetNoPop: any, datasetPop: any, geoLevel: any) {
    const populationByKey: Record<string, any> = {};

    // Crear índice rápido a partir de datasetPop
    datasetPop.forEach((d: any) => {
      const key: string = `${d.Year}_${d[geoLevel]}`;
      populationByKey[key] = d["Citizenship Status"];
    });

    // Agregar "Total Population" al datasetNoPop
    datasetNoPop.forEach((d: any) => {
      const key: string = `${d.Year}_${d[geoLevel]}`;
      d["Citizenship Status"] = populationByKey[key] ?? null;
    });

    return datasetNoPop;
  }

  return {
    data: [dataURL, dataSimilarNation, dataPopURL, dataSimilarPop],
    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataSimilar = resp[1].data;
    
      const dataIDPop = resp[2].data;
      const dataSimilarPop = resp[3].data;
    
    
      dataSimilar.forEach((d: any) => {
        d[hierarchy] = d[similarHierarchy]
        d[`${hierarchy} ID`] = d[`${similarHierarchy} ID`]

        delete d[similarHierarchy]
        delete d[`${similarHierarchy} ID`]
      })
    
      dataSimilarPop.forEach((d: any) => {
        d[hierarchy] = d[similarHierarchy]
        d[`${hierarchy} ID`] = d[`${similarHierarchy} ID`]

        delete d[similarHierarchy]
        delete d[`${similarHierarchy} ID`]
      })
    
      const dataIDPopulation = mergePopulation(dataID, dataIDPop, `${hierarchy} ID`);
      const dataSimilarPopulation = mergePopulation(dataSimilar, dataSimilarPop, `${hierarchy} ID`);
    
      const dataFinal: any = [...dataIDPopulation, ...dataSimilarPopulation];
    
      dataFinal.forEach((d: any) => {
        d[share] = d[measure] / d["Citizenship Status"];
      });

      return dataFinal.filter((d: any) => d[share] > 0);
    },
    discrete: "y",
    groupBy: `${hierarchy}`,
    shapeConfig: {
      fill: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey
    },
    time: "Year",
    tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        ["Foreign-Born Citizens", (d: any) => abbreviate(d["Foreign-Born Citizens"])],
        ["Citizenship", (d: any) => `${abbreviate(d[share] * 100)}%`]
      ]
    },
    legendTooltip: {
      title: (d: any) => d[`${hierarchy} ID`] === id ? "Profile" : "Parents and Neighbors"
    },
    type: "BarChart",
    x: share,
    xConfig: {
      tickFormat: (d: any) => `${abbreviate(d * 100)}%`,
      title: share
    },
    y: hierarchy,
    yConfig: {
      barConfig: {stroke: "transparent"},
      ticks: [],
      title: false
    },
    ySort: (a: any, b: any) => a[share] - b[share]
  }  

};

export default viz;
