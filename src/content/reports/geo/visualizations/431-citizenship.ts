// Converted from legacy canon_cms_section_visualization #431 "section citizenship" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters, locale}) => {
  const {colorGrey, colorHighlight, hierarchy, id, tesseract, similarHierarchy, similarID} = variables;
  const {nest, sum} = libs.d3;
  const {abbreviate} = formatters;

  const measure: string = "Citizenship Status";
  const share: string = "Citizenship %";

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${hierarchy}:${id}&drilldowns=Year,${hierarchy},Citizenship&locale=en&measures=Citizenship+Status`
  const dataSimilarNation: string = `${tesseract}tesseract/data.jsonrecords?cube=acs_ygc_citizenship_status_5&include=${similarHierarchy}:${similarID}&drilldowns=Year,${similarHierarchy},Citizenship&locale=en&measures=Citizenship+Status`

  return {
    data: [dataURL, dataSimilarNation],
    dataFormat: (resp: any) => {
      const dataID = resp[0].data;
      const dataSimilar = resp[1].data;
  
      dataSimilar.forEach((d: any) => {
        d[hierarchy] = d[similarHierarchy]
        d[`${hierarchy} ID`] = d[`${similarHierarchy} ID`]

        delete d[similarHierarchy]
        delete d[`${similarHierarchy} ID`]
      })

      const dataFinal: any = [...dataID, ...dataSimilar];

      const data: any = [];
      nest()
        .key((d: any) => `${d.Year}_${d[hierarchy]}`)
        .entries(dataFinal)
        .forEach((group: any) => {
          const total = sum(group.values, (d: any) => d[measure]);
          const natives = group.values.find((d: any) => d["Citizenship ID"] === 0)[measure];
          data.push(Object.assign({}, group.values[0], {[share]: natives / total }));
        });

      return data.filter((d: any) => d[share] > 0);
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
