// Converted from legacy canon_cms_generator #517 "[Education] Graduates (Majors by Degree)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 517,
  name: "[Education] Graduates (Majors by Degree)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&include=${attrs.hierarchy}:${attrs.id}&drilldowns=CIP6,Degree&locale=en&measures=Completions&time=Year.latest&sort=Completions.desc`,
  logic: (resp) => {

    const data = resp.data;

      if(data.length > 0){
  
      // 1. Agrupar por Degree
      const grouped = data.reduce((acc: any, d: any) => {
        const id = d["Degree ID"];
        if (!acc[id]) acc[id] = [];
        acc[id].push(d);
        return acc;
      }, {});
  
      const result: Record<string, any> = {};
  
      // 2. Ordenar y tomar top 3
      Object.entries(grouped).forEach(([degreeId, rows]: any) => {
  
        const top3 = rows
          .sort((a: any, b: any) => b["Completions"] - a["Completions"])
          .slice(0, 3);
  
        top3.forEach((d: any, i: any) => {
  
          result[`degree${degreeId}CIP${i + 1}Name`] =
            d["CIP6"]
              ? `<a href="/profile/cip/${d["Slug CIP6"] || d["CIP6 ID"]}">${d["CIP6"]}</a>`
              : false;
  
          result[`degree${degreeId}CIP${i + 1}Value`] =
            d["Completions"] || false;
  
        });
  
      });
  
      return result;
    }
    else{
      return{
        result: false
      }
    }
  }
};

export default generator;
