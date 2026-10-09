// Converted from legacy canon_cms_generator #407 "[Business] Industry Flow Commodity -> Industry-duplicate" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 407,
  name: "[Business] Industry Flow Commodity -> Industry-duplicate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Industry+L0=${attrs.beaL0}&cube=bea_use&drilldowns=Commodity+L0,Industry+L0,Year&measures=Value+Millions&time=year.latest`,
  logic: (resp, {libs, variables}) => {
    const {beaL0} = variables;
    const {sum, nest, max} = libs.d3;
    const data = resp.data;

    const id = beaL0

    if(beaL0 === "11,21"){

      const aggregatedData: any = [];
      nest()
        .key((d: any) => `${d["Year"]}_${d["Commodity L0 ID"]}`)
        .entries(data)
        .forEach((group: any) => {
          const sum11 = sum(group.values.filter((d: any) => d["Industry L0 ID"] === "11"), (d: any) => +d["Value Millions"]);
          const sum21 = sum(group.values.filter((d: any) => d["Industry L0 ID"] === "21"), (d: any) => +d["Value Millions"]);
      
          const aggregatedEntry: Record<string, any> = {
            "Year": group.values[0]["Year"],
            "Industry L0 ID": "11,21",
            "Industry L0": "Agriculture, forestry, fishing and hunting, and mining",
            "Commodity L0 ID": group.values[0]["Commodity L0 ID"],
            "Commodity L0": group.values[0]["Commodity L0"],
            "Value Millions": sum11 + sum21
          };
      
          aggregatedData.push(aggregatedEntry);
        });

      const centerData = aggregatedData.find((d: any) => d["Industry L0 ID"] === id);
  
      const center: Record<string, any> = {
        id: `${id}`,
        name: centerData["Industry L0"],
        level0: id,
        input: sum(aggregatedData, (d: any) => d["Value Millions"]),
        direction: "Center"
      };
  
      const nodes = aggregatedData.map((d: any) => {
        return {
          id: `${d["Commodity L0 ID"]}_input`,
          name: d["Commodity L0"],
          level0: d["Commodity L0 ID"],
          value: d["Value Millions"],
          direction: "Input"
        }
      });

      const nodesFlow1: any = [center].concat(nodes);
      const linksFlow1 = aggregatedData.map((d: any) => ({source: `${d["Commodity L0 ID"]}_input`, target: d["Industry L0 ID"], value: d["Value Millions"]}));
      return {
        nodesFlow1,
        linksFlow1
      }
    }


    else {
      const centerData = data.find((d: any) => d["Industry L0 ID"] === id);
  
      const center: Record<string, any> = {
        id: `${id}`,
        name: centerData["Industry L0"],
        level0: id,
        input: sum(data, (d: any) => d["Value Millions"]),
        direction: "Center"
      };
  
      const nodes = data.map((d: any) => {
        return {
          id: `${d["Commodity L0 ID"]}_input`,
          name: d["Commodity L0"],
          level0: d["Commodity L0 ID"],
          value: d["Value Millions"],
          direction: "Input"
        }
      });
  
      const nodesFlow1: any = [center].concat(nodes);
      const linksFlow1 = data.map((d: any) => ({source: `${d["Commodity L0 ID"]}_input`, target: d["Industry L0 ID"], value: d["Value Millions"]}));
      return {
        nodesFlow1,
        linksFlow1
      }

    }

  }
};

export default generator;
