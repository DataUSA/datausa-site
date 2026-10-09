// Converted from legacy canon_cms_materializer #62 "[Education] Degrees " (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 62,
  name: "[Education] Degrees ",
  ordering: 20,
  allowed: "always",
  logic: (variables, {libs, formatters}) => {
    const {dataDegrees, stateParentId, electionStateIDs, isMSA} = variables;
    const {abbreviate} = formatters;
    const {sum,nest} = libs.d3;

    const lastYearDegrees_: any = dataDegrees[0] ? dataDegrees[0]["Year"] : false

    const dataDegrees_ = isMSA ? dataDegrees.filter((d: any) => {return electionStateIDs.includes(d["State ID"])}) 
                        : dataDegrees.filter((d: any) => d["State ID"] === stateParentId)
                    
    nest()
      .key((d: any) => d["Group ID"])
      .entries(dataDegrees_)
      .forEach((group: any) => {
        const total = sum(group.values, (d: any) => d["Total Population"])
        group.values.forEach((d: any) => {
          d["Total"] = total
          d["id"] = d["Group ID"]
          delete d["State"]
        });
      })  

    const ids = dataDegrees_.map((o: any) => o["Group ID"])
    const filtered = dataDegrees_.filter(({id}: any, index: any) => !ids.includes(id, index + 1))
                
    filtered.sort((a: any, b: any) => b["Total"] > a["Total"] ? 1 : -1);

    const top3DegreesPopulation_: any = filtered[0] ? filtered.slice(0, 3).map((d: any, i: any) => `${d["Group"]} (${abbreviate(d["Total"])})`) : false

    return{
      lastYearDegrees_,
      top3DegreesPopulation_
    }
  }
};

export default materializer;
