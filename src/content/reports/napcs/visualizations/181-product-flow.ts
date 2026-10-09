// Converted from legacy canon_cms_section_visualization #181 "section product-flow" (profile: napcs) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {VizDefinition} from "@/lib/reports/types";

const viz: VizDefinition = (variables, {libs, formatters}) => {
  const {colorGrey, colorHighlight, exportData, exporterYear, id, importData, name, sctg, tesseract} = variables;
  const {dollar} = formatters;
  const {nest} = libs.d3;

  const center: Record<string, any> = {id, name};
  const nodes: any = [center];
  const links: any = [];

  nest()
    .key((d: any) => d["Origin State ID"])
    .entries(exportData)
    .forEach((state: any) => {
      const n: Record<string, any> = {id: `export${state.key}`, name: state.values[0]["Origin State"]};
      const link: Record<string, any> = {
        source: n.id,
        target: center.id
      };
      state.values.forEach((d: any) => {
        link[`value${d.Year}`] = d["Millions Of Dollars"];
        n[`value${d.Year}`] = d["Millions Of Dollars"];
      });
      nodes.push(n);
      links.push(link);
    });

  nest()
    .key((d: any) => d["Destination State ID"])
    .entries(importData)
    .forEach((state: any) => {
      const n: Record<string, any> = {id: `import${state.key}`, name: state.values[0]["Destination State"]};
      const link: Record<string, any> = {
        source: center.id,
        target: n.id
      };
      state.values.forEach((d: any) => {
        link[`value${d.Year}`] = d["Millions Of Dollars"];
        n[`value${d.Year}`] = d["Millions Of Dollars"];
      });
      nodes.push(n);
      links.push(link);
    });

  const dataURL: string = `${tesseract}tesseract/data.jsonrecords?cube=dot_faf&SCTG2=${sctg}&measures=Millions Of Dollars&Year=${variables.freightYear}&drilldowns=Destination%20State,Year&sort=Millions Of Dollars.desc`

  return {
    data: dataURL,
    //`/api/data?SCTG2=${variables.id}&measures=Millions%20Of%20Dollars&Year=${variables.freightYear}&drilldowns=Destination%20State&order=Millions%20Of%20Dollars`,
    height: 700,
    label: (d: any) => d.name,
    nodes: nodes,
    nodePadding: 1,
    nodeWidth: 150,
    links: links,
    shapeConfig: {
      fill: (d: any) => d.id === id ? colorHighlight : colorGrey,
      Rect: {
        label: (d: any) => d.name,
        labelConfig: {
          textAnchor: "middle",
          verticalAlign: "middle"
        }
      }
    },
    tooltipConfig: {
      title: (d: any) => d.name,
      tbody: [
        ["Value", (d: any) => d.id != id ? dollar(d[`value${exporterYear}`] * 1000000) : dollar(d['Millions Of Dollars'])]
      ]
    },
    type: "Sankey",
    value: (d: any) => d[`value${exporterYear}`]
  }
};

export default viz;
