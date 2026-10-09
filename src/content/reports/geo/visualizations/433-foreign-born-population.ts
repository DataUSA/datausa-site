// Converted from legacy canon_cms_section_visualization #433 "section foreign_born_population" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, neighborsList, similarHierarchy, similarID, resultSimilar} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate} = formatters;

  const measure: string = "Foreign-Born Citizens";
  const share: string = "Foreign-Born %";
  const neighbors = hierarchy === "Place" ? "" : `,${neighborsList}`

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygf_place_of_birth_for_foreign_born_5&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy}&locale=en&measures=Foreign-Born+Citizens`
  const dataNation: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygf_place_of_birth_for_foreign_born_5&include=Nation:01000US&drilldowns=Year,Nation&locale=en&measures=Foreign-Born+Citizens`

  const dataURLPop: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy}&locale=en&measures=Citizenship+Status`
  const dataNationPop: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=Nation:01000US&drilldowns=Year,Nation&locale=en&measures=Citizenship+Status`

  //Crear diferentes URL según la cantidad de hierarchies diferentes
  const baseURL: string = `${tesseract}tesseract/data.jsonrecords`; 
  const cube: string = "acs_ygf_place_of_birth_for_foreign_born_5"; 
  const cubePop: string = "pums_5";

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
        measures: measure,
        cube,
        include: `${hierarchy}:${ids}`
      });

      return `${baseURL}?${params.toString()}`;
    })
    .filter(Boolean);
  
  //URL with Population data
  const dataPopulationURLs = Object.entries(resultSimilar)
    .filter(([key]: any) => /^similarID\d+$/.test(key))
    .map(([key]: any) => {
      const index = key.replace("similarID", ""); // extrae el número
      const ids = resultSimilar[key]; // string separado por comas
      const hierarchy = resultSimilar[`similarHierarchy${index}`];
    
      if (!hierarchy) return null; // evitar entradas inválidas

      const drilldowns: string = `Year,${hierarchy}`;
      const params = new URLSearchParams({
        drilldowns,
        measures: "Citizenship Status",
        cube: "acs_ygc_citizenship_status_5",
        include: `${hierarchy}:${ids}`
      });

      return `${baseURL}?${params.toString()}`;
    })
    .filter(Boolean);

  const similarHierarchies = resultSimilar.similarHierarchiesArray;
  const numSimilar = similarHierarchies.length;


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


  function mergeBirthplace(data: any, hierarchyID: any) {
    const birthplaceByKey: Record<string, any> = {};
    data.forEach((d: any) => {
      if (d["Citizenship Status"]) {
        const key: string = `${d.Year}_${d[hierarchyID]}`;
        birthplaceByKey[key] = d["Citizenship Status"];
      }
    });

    const filtered = data.filter((d: any) => d["Foreign-Born Citizens"] !== undefined && d["Foreign-Born Citizens"] !== null);

    const merged = filtered.map((d: any) => {
      if (!d["Citizenship Status"]) {
        const key: string = `${d.Year}_${d[hierarchyID]}`;
        d["Citizenship Status"] = birthplaceByKey[key] ?? null;
      }
      return d;
    });

    return merged.filter((d: any) => d["Citizenship Status"] !== null);
  }

  return {
    data: [dataURL, dataNation, dataURLPop, dataNationPop, ...dataSimilarURLs, ...dataPopulationURLs],
    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataNation = resp[1].data;
    
      const dataPop = resp[2].data;
      const dataNationPop = resp[3].data;
    
      const dataSimilarArrays = resp.slice(4, 4 + numSimilar).map((r: any) => r?.data || []);
      const dataPopulationArrays = resp.slice(4 + numSimilar).map((r: any) => r?.data || []);
  
      const tempData = dataID.filter((d: any) => d[`${hierarchy} ID`] === id);
      const maxYear = libs.d3.max(tempData, (d: any) => d.Year);
      const minYear = libs.d3.min(tempData, (d: any) => d.Year);

      dataNation.forEach((d: any) => {
        d[hierarchy] = d["Nation"]
        d[`${hierarchy} ID`] = d["Nation ID"]
        delete d["Nation"]
        delete d["Nation ID"];
      });
    
      dataNationPop.forEach((d: any) => {
        d[hierarchy] = d["Nation"]
        d[`${hierarchy} ID`] = d["Nation ID"]
        delete d["Nation"]
        delete d["Nation ID"];
      });

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
    
      similarHierarchies.forEach((simHier: any, i: any) => {
        const dataSimilar = dataPopulationArrays[i];
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
    
      const dataIDPopulation = mergePopulation(dataID, dataPop, `${hierarchy} ID`);
      const dataNationPopulation = mergePopulation(dataNation, dataNationPop, `${hierarchy} ID`);

      const dataTempSimilar: any = [...dataPopulationArrays.flat(), ...dataSimilarArrays.flat()]
      const similarPopulation = mergeBirthplace(dataTempSimilar, `${hierarchy} ID`);
    
      const dataFinal: any = [...dataIDPopulation, ...dataNationPopulation, ...similarPopulation]

      dataFinal.forEach((d: any) => {
        d[share] = d[measure] / d["Citizenship Status"];
      });

      return dataFinal.filter((d: any) => d[hierarchy] && d["Year"]*1 <= maxYear*1 && d["Year"]*1 >= minYear*1);
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
