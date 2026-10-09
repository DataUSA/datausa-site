// Converted from legacy canon_cms_generator #413 "[Business] Industry Flow Industry -> Commodity-duplicate" (profile: naics) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 413,
  name: "[Business] Industry Flow Industry -> Commodity-duplicate",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?Commodity+L0=${attrs.beaL0}&cube=bea_use&drilldowns=Commodity+L0,Industry+L0,Year&measures=Value+Millions&time=year.latest`,
  logic: (resp, {libs, variables}) => {
    // .filter((d: any) => !["ORE", "VA", "FINALUSES", "G"].includes(d["ID Industry L0"]))
    const data = resp.data;
    const {beaL0} = variables;
    const {sum, nest, max} = libs.d3;

    if(beaL0 === "11,21"){
      const aggregatedData: any = [];
      nest()
        .key((d: any) => `${d["Year"]}_${d["Industry L0 ID"]}`)
        .entries(data)
        .forEach((group: any) => {
          const sum11 = sum(group.values.filter((d: any) => d["Commodity L0 ID"] === "11"), (d: any) => +d["Value Millions"]);
          const sum21 = sum(group.values.filter((d: any) => d["Commodity L0 ID"] === "21"), (d: any) => +d["Value Millions"]);
      
          const aggregatedEntry: Record<string, any> = {
            "Year": group.values[0]["Year"],
            "Commodity L0 ID": "11,21",
            "Commodity L0": "Agriculture, forestry, fishing and hunting, and mining",
            "Industry L0 ID": group.values[0]["Industry L0 ID"],
            "Industry L0": group.values[0]["Industry L0"],
            "Value Millions": sum11 + sum21
          };
      
          aggregatedData.push(aggregatedEntry);
        });

      const nodes = aggregatedData.map((d: any) => {
        return {
          id: `${d["Industry L0 ID"]}_output`,
          name: d["Industry L0"],
          level0: d["Industry L0 ID"],
          value: d["Value Millions"],
          direction: "Output"
        }
      });
      //d["ID Commodity L0"]
      const nodesFlow2 = nodes;
      const linksFlow2 = aggregatedData.map((d: any) => ({source: d["Commodity L0 ID"], target: `${d["Industry L0 ID"]}_output`, value: d["Value Millions"]}));
  
      return {
      nodesFlow2,
      linksFlow2
    }

    }

    else{
      const nodes = data.map((d: any) => {
        return {
          id: `${d["Industry L0 ID"]}_output`,
          name: d["Industry L0"],
          level0: d["Industry L0 ID"],
          value: d["Value Millions"],
          direction: "Output"
        }
      });
      //d["ID Commodity L0"]
      const nodesFlow2 = nodes;
      const linksFlow2 = data.map((d: any) => ({source: d["Commodity L0 ID"], target: `${d["Industry L0 ID"]}_output`, value: d["Value Millions"]}));

      return {
      nodesFlow2,
      linksFlow2
    }

  
    }



  }
};

export default generator;
