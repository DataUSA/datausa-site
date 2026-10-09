// Converted from legacy canon_cms_generator #752 "[Helper] Similar" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 752,
  name: "[Helper] Similar",
  allowed: "always",
  api: attrs => `api/geo/similar/${attrs.id}`,
  logic: (resp, {variables}) => {
    //En algunos niveles geográficos, la api para similar retorna varios niveles. Por ejemplo, estando en MSA, retorna States y MSA similares
    //Vamos a generar variables para los distintos niveles
    const data = resp.filter((d: any) => d["hierarchy"] !== variables.hierarchy && d["hierarchy"] !== "Nation");

    if(variables.hierarchy !== "Nation"){
      const grouped: Record<string, any> = {};
      data.forEach((d: any) => {
        if (!grouped[d.hierarchy]) grouped[d.hierarchy] = [];
        grouped[d.hierarchy].push(d.id);
      });
  
  
      const resultSimilar: Record<string, any> = {};
      const similarHierarchyList: any = [];
      const similarIDList: any = [];
  
      let index = 1;
      for (const [hierarchy, ids] of Object.entries(grouped)) {
        const hKey: string = `similarHierarchy${index}`;
        const idKey: string = `similarID${index}`;
        resultSimilar[hKey] = hierarchy;
        resultSimilar[idKey] = ids.join(",");
        similarHierarchyList.push(hKey);
        similarIDList.push(idKey);
        index++;
      }
  
      resultSimilar.similarHierarchy = similarHierarchyList.join(",");
      resultSimilar.similarID = similarIDList.join(",");
  
      const similarHierarchiesArray = similarHierarchyList.map((k: any) => resultSimilar[k]);
      resultSimilar.similarHierarchiesArray = similarHierarchiesArray;
  
      return {
        resultSimilar
      };
    }

    else{
      const similarID = data.map((d: any) => d.id).join(",")
      const similarHierarchy = data[0]["hierarchy"]
  
      return{
        similarID,
        similarHierarchy
      }
    }
  }
};

export default generator;
