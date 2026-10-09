// Converted from legacy canon_cms_generator #488 "[Graduates] Majors Awarded" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 488,
  name: "[Graduates] Majors Awarded",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=CIP6%2CDegree%2CYear&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs}) => {
    const data_ = resp.data.filter((d: any) => d["Completions"] > 0)

    if(data_.length > 0){
      const latestYear = libs.d3.max(data_, (d: any) => d["Year"]);
      let data = data_.filter((d: any) => d["Year"] === latestYear);
  
      data.sort((a: any, b: any) => b["Degree ID"] - a["Degree ID"])
  
      const counter: Record<string, any> = {};
      const url = (d: any) => `<a href='/profile/cip/${d["CIP6 ID"]}'>${d["CIP6"]}</a>`;
  
      return data.reduce((obj: any, d: any, i: any) => {
        if (counter[d["Degree ID"]] != undefined) {
          counter[d["Degree ID"]]++;
        } else {
          counter[d["Degree ID"]] = 0;
        }
        const rank = counter[d["Degree ID"]];
        const id = d["Degree ID"];
    
        if (rank + 1 > 3) {
          return obj; // Skip further iterations when rank + 1 exceeds 3
        }
    
        obj[`degree${id}Top${rank + 1}Name`] = url(d);
        obj[`degree${id}Top${rank + 1}Value`] = d["Completions"] === 0 ? false : d["Completions"];
        return obj;
      }, {});
    }
    else{
      return{
        degreeTop1Value: false
      }
    }
  }
};

export default generator;
