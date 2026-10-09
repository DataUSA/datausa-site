// Converted from legacy canon_cms_section_visualization #436 "section rent_own" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, hierarchy, id, name, tesseract, neighborsList, similarHierarchy, similarID, resultSimilar} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, growthPct} = formatters;

  const optionSelected = swap("[[rentMortgage]]") //rentOwn, homeownersMortgage

  const measure = optionSelected === "rentOwn" ? "Household Ownership" : "Homeowners by Mortgage"

  const drilldown = optionSelected === "rentOwn" ? "Occupied By" : "Mortgage Status"
  const title = optionSelected === "rentOwn" ? "Homeownership" : "Homeowners with Mortgage"
  const cube = optionSelected === "rentOwn" ? "acs_ygo_tenure_5" : "acs_ygh_homeowners_with_mortgage_spending_30_percent_on_costs_5"

  const neighbors = hierarchy === "Place" ? "" : `,${neighborsList}`

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy},${drilldown}&locale=en&measures=${measure},${measure}+Moe`
  const dataNation: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=Nation:01000US&drilldowns=Year,Nation,${drilldown}&locale=en&measures=${measure},${measure}+Moe`

  //Crear diferentes URL según la cantidad de hierarchies diferentes
  const baseURL: string = `${tesseract}tesseract/data.jsonrecords`; // reemplaza con tu base

  //URL para hierarchies similares
  const dataSimilarURLs = Object.entries(resultSimilar)
    .filter(([key]: any) => /^similarID\d+$/.test(key))
    .map(([key]: any) => {
      const index = key.replace("similarID", ""); // extrae el número
      const ids = resultSimilar[key]; // string separado por comas
      const hierarchy = resultSimilar[`similarHierarchy${index}`];
    
      if (!hierarchy) return null; // evitar entradas inválidas

      const drilldowns: string = `Year,${drilldown},${hierarchy}`;
      const params = new URLSearchParams({
        drilldowns,
        measures: `${measure},${measure} Moe`,
        cube,
        include: `${hierarchy}:${ids}`
      });

      return `${baseURL}?${params.toString()}`;
    })
    .filter(Boolean);

  const similarHierarchies = resultSimilar.similarHierarchiesArray;

  function removeDuplicates(array: any) {
    const seen = new Set();
    return array.filter((item: any) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return {
    cache: false,
    data: [dataURL, dataNation, ...dataSimilarURLs],
    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataNation = resp[1].data;
      const dataSimilarArrays = resp.slice(2).map((r: any) => r.data)
    
      const tempData = dataID.filter((d: any) => d[`${hierarchy} ID`] === id);
      const maxYear = libs.d3.max(tempData, (d: any) => d.Year)
      const minYear = libs.d3.min(tempData, (d: any) => d.Year)

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

      const dataFinal: any = [...dataID, ...dataNation, ...dataSimilarArrays.flat()]

      nest().key((d: any) => `${d.Year}_${d[`${hierarchy} ID`]}`)
        .entries(dataFinal)
        .forEach((group: any) => {
          const owners = group.values.find((d: any) => d[`${drilldown} ID`]*1 === 0);
          const renters = group.values.find((d: any) => d[`${drilldown} ID`]*1 === 1);
          owners.share = owners[measure] / (owners[measure] + renters[measure]);
          dataFinal.push(owners);
        });
      
      const uniqueData = removeDuplicates(dataFinal.filter((d: any) => d[`${drilldown} ID`] === 0));

      return uniqueData.filter((d: any) => d["Year"]*1 >= minYear && d["Year"]*1 <= maxYear);
    },
    groupBy: `${hierarchy}`,
    legend: true,
    legendConfig: {
      label: (d: any) => d[`${hierarchy} ID`] === id ? name : "Parents and Neighbors",
    },
    legendTooltip: {
      title: (d: any) => d[`${hierarchy} ID`] === id ? name : "Parents and Neighbors",
      tbody: []
    },
    lineLabels: true,
    shapeConfig: {
      Line: {
        labelConfig: {
          fontColor: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey,
          fontFamily: () => ["Pathway Gothic One", "Arial Narrow", "sans-serif"],
          fontSize: () => 12,
          fontStroke: "#E9E9E9",
          fontStrokeWidth: 0.1
        },
        stroke: (d: any) => d[`${hierarchy} ID`] === id ? colorHighlight : colorGrey
      }
    },
    time: "Year",
    timeline: false,
     tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        [title, (d: any) => abbreviate(d[measure])],
        ["Margin of Error", (d: any) => `± ${abbreviate(d[`${measure} Moe`])}`],
        ["Share", (d: any) => `${abbreviate(d.share * 100)}%`]
      ]
    },
    type: "LinePlot",
    x: "Year",
    y: "share",
    yConfig: {
      tickFormat: (d: any) => `${growthPct(d * 100)}`,
      title: title
    },
  }
};

export default viz;
