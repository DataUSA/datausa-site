// Converted from legacy canon_cms_materializer #3 "Graduates" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 3,
  name: "Graduates",
  ordering: 5,
  allowed: "always",
  logic: (variables, {formatters}) => {
    const {abbreviate, commas} = formatters;
    const {cipGrads, ipedsGradsCurr, universityGrads} = variables;

    if(universityGrads){

      const uniList: any = universityGrads[0] ? universityGrads.slice(0, 3).map((d: any) => `<a href="/profile/university/${d["Slug University"] || d["University ID"]}">${d["University"]}</a> (${commas(d["Completions"])} and ${abbreviate(d["Completions"] / ipedsGradsCurr * 100)}%)`) : false;
      const cipList: any = cipGrads[0] ? cipGrads.map((d: any) => `<a href="/profile/cip/${d["Slug CIP6"] || d["ID CIP6"]}">${d["CIP6"]}</a> (${commas(d["Completions"])} and ${abbreviate(d["Completions"] / ipedsGradsCurr * 100)}%)`) : false;
  
      return {
        cipGradsList: cipList,
        universityGradsList: uniList
      }
    }
    else{
      return{
        cipGradsList: false,
        universityGradsList: false,
      }
    }
  }
};

export default materializer;
