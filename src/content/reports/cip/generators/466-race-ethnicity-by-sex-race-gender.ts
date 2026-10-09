// Converted from legacy canon_cms_generator #466 "[Race & Ethnicity by Sex] Race & Gender" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 466,
  name: "[Race & Ethnicity by Sex] Race & Gender",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Gender,Year,IPEDS Race,Degree&${attrs.hierarchy}=${attrs.id}&exclude=Degree:20,21&locale=en&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs}) => {
    const { nest, max } = libs.d3;
    const latestYear: any = resp.data[0] ? max(resp.data, (d: any) => d["Year"]) : false;
    const data = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : [];

    const obj: Record<string, any> = {};

    if(!data[0]) {
  
      return{
        raceEthnicityBySex: false
      }
    }


    else if (data[0]) {
      nest()
        .key((d: any) => d["Degree ID"])
        .entries(data)
        .forEach((group: any) => {
          const id = group.key;
          group.values
            .slice(0, 3)
            .sort((a: any, b: any) => b["Completions"] - a["Completions"])
            .forEach((d: any, i: any) => {
              obj[`degree${id}RG${i + 1}Name`] = `${d["IPEDS Race"]} ${d["Gender"] == "Men" ? "Male" : "Female"}`;
              obj[`degree${id}RG${i + 1}Value`] = d["Completions"];
              obj[`degree${id}RG${i + 1}Viz`] = d["Completions"] === 0 ? false : true;
            });
        });
    }

    const result: Record<string, any> = { raceEthnicityBySex: data[0] ? true : false };

    // Extract the elements inside obj and add them to the result
    Object.keys(obj).forEach((key: any) => {
      result[key] = obj[key];
    });

    return result;

  }
};

export default generator;
