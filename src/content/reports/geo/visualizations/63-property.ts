// Converted from legacy canon_cms_section_visualization #63 "section property" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale, swap}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, neighborsList, similarHierarchy, similarID, resultSimilar} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate, salary} = formatters;

  const measureSelected = swap("[[propertyTaxesValue]]") // propertyTaxes, propertyValue
  const measureName = swap("{{[[propertyTaxesValue]]}}") 

  const measure = measureSelected === "propertyTaxes" ? "Real Estate Taxes by Mortgage" : "Property Value by Bucket"
  const drilldown = measureSelected === "propertyTaxes" ? "Real Estate Taxes Paid" : "Value Bucket"
  const cube = measureSelected === "propertyTaxes" ? "acs_ygmt_mortgage_status_by_real_estate_taxes_5" : "acs_ygo_housing_value_bucket_5"


  const neighbors = hierarchy === "Place" ? "" : `,${neighborsList}`

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=${cube}&include=${hierarchy}:${id}${neighbors}&drilldowns=Year,${hierarchy}&locale=en&measures=${measure},${measure}+Moe`

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
        measures: `${measure},${measure} Moe`,
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
      
      const dataFinal: any = [...dataID, ...dataSimilarArrays.flat()]//.filter((d: any) => d[hierarchy]);

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
    tooltipConfig: {
      title: (d: any) => d[hierarchy],
      tbody: [
        ["Year", (d: any) => d.Year],
        [`Median ${measureName}`, (d: any) => salary(d[measure])],
        ["Margin of Error", (d: any) => `± ${salary(d[`${measure} Moe`])}`],
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
      title: "Median Value"
    },
  }
};

export default viz;
