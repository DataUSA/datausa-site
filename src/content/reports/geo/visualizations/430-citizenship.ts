// Converted from legacy canon_cms_section_visualization #430 "section citizenship" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, neighborsList, similarHierarchy, similarID, resultSimilar} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate} = formatters;

  const measure: string = "Citizenship Status";
  const share: string = "Citizenship %";
  const neighbors = hierarchy === "Place" ? "" : `,${neighborsList}`

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy},Citizenship&locale=en&measures=Citizenship+Status`
  const dataNation: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=Nation:01000US&drilldowns=Year,Nation,Citizenship&locale=en&measures=Citizenship+Status`

  //Crear diferentes URL según la cantidad de hierarchies diferentes
  const baseURL: string = `${tesseract}tesseract/data.jsonrecords`; // reemplaza con tu base
  const cube: string = "acs_ygc_citizenship_status_5"; // reemplaza si necesario

  //URL para hierarchies similares
  const dataSimilarURLs = Object.entries(resultSimilar)
    .filter(([key]: any) => /^similarID\d+$/.test(key))
    .map(([key]: any) => {
      const index = key.replace("similarID", ""); // extrae el número
      const ids = resultSimilar[key]; // string separado por comas
      const hierarchy = resultSimilar[`similarHierarchy${index}`];
    
      if (!hierarchy) return null; // evitar entradas inválidas

      const drilldowns: string = `Year,Citizenship,${hierarchy}`;
      const params = new URLSearchParams({
        drilldowns,
        measures: measure,
        cube,
        include: `${hierarchy}:${ids}`
      });

      return `${baseURL}?${params.toString()}`;
    })
    .filter(Boolean);

  const similarHierarchies = resultSimilar.similarHierarchiesArray;

  return {
    data: [dataURL, dataNation, ...dataSimilarURLs],

    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataNation = resp[1].data;
      const dataSimilarArrays = resp.slice(2).map((r: any) => r.data)
    
      const dataPlace = dataID.filter((d: any) => d[`${hierarchy} ID`] === id)
      const maxYear = libs.d3.max(dataPlace, (d: any) => d.Year)
      const minYear = libs.d3.min(dataPlace, (d: any) => d.Year)

      dataNation.forEach((d: any) => {
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
      
      const dataFinal: any = [...dataID, ...dataNation, ...dataSimilarArrays.flat()]//.filter((d: any) => d[hierarchy]);

      const data: any = [];
      nest()
        .key((d: any) => `${d.Year}_${d[hierarchy]}`)
        .entries(dataFinal)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          const natives = group.values.find((d: any) => d["Citizenship ID"] === 0)[measure];
          data.push(Object.assign({}, group.values[0], {[share]: natives / total }));
        });
      
      return data.filter((d: any) => d[hierarchy] && d["Year"]*1 <= maxYear*1 && d["Year"]*1 >= minYear*1);
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
