// Converted from legacy canon_cms_materializer #100 "Birthplace MOE Values" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {MaterializerDefinition} from "@/lib/reports/types";

const materializer: MaterializerDefinition = {
  id: 100,
  name: "Birthplace MOE Values",
  ordering: 21,
  allowed: "always",
  logic: (variables, {libs}) => {
    const {dataMOEBirthPlace, dataBirthPlace} = variables;
    const {nest} = libs.d3;
    const {merge} = libs.d3plus;

    dataBirthPlace.forEach((popItem: any) => {
      const matchingMoeItem = dataMOEBirthPlace.find((moeItem: any) =>
          moeItem.Year === popItem.Year &&
          moeItem["Birthplace ID"] === popItem["Birthplace ID"]
      );

      if (matchingMoeItem) {
        popItem["Total Population MOE Appx"] = matchingMoeItem["Total Population MOE Appx"];
      } else {
        popItem["Total Population MOE Appx"] = null;
      }
    });

    const retObj: Record<string, any> = {};

    nest()
      .key((d: any) => d["Birthplace ID"])
      .entries(dataBirthPlace)
      .map((group: any) => {
        return merge(group.values);
      })
      .sort((a: any, b: any) => b["Total Population"] - a["Total Population"])
      .slice(0, 3)
      .forEach((d: any, i: any) => {
        retObj[`birthplace${i + 1}Moe`] = d["Total Population MOE Appx"] ;
      });

    return retObj;


  }
};

export default materializer;
