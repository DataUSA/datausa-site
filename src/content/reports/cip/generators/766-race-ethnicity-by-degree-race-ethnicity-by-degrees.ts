// Converted from legacy canon_cms_generator #766 "[Race & Ethnicity by Degree] Race & Ethnicity by Degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 766,
  name: "[Race & Ethnicity by Degree] Race & Ethnicity by Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?${attrs.hierarchy}=${attrs.id}&cube=ipeds_completions&drilldowns=Year,Degree,IPEDS+Race&locale=en&measures=Completions&filters=Completions.gt.0&top=3.Degree,Year.Completions.desc`,
  logic: (resp, {libs}) => {
    const { nest, max } = libs.d3;

    const obj: Record<string, any> = {};

    if (!resp.data || resp.data.length === 0) {
      return {
        raceByDegrees: false
      };
    }

    nest()
      .key((d: any) => d["Degree ID"])
      .entries(resp.data)
      .forEach((group: any) => {

        // Último año disponible para ESTE degree
        const latestYear = max(group.values, (d: any) => d["Year"]);

        // Datos de ese último año
        const latestData = group.values.filter(
          (d: any) => d["Year"] === latestYear
        );

        latestData
          .sort((a: any, b: any) => b["Completions"] - a["Completions"])
          .slice(0, 3)
          .forEach((d: any, i: any) => {
            const id = group.key;

            obj[`degree${id}RaceName${i + 1}`] = d["IPEDS Race"];
            obj[`degree${id}RaceValue${i + 1}`] = d["Completions"];
            obj[`degree${id}RaceVisible${i + 1}`] = d["Completions"] !== 0;
            obj[`degree${id}RaceYear${i + 1}`] = d["Year"];
          });
      });

    return {
      raceByDegrees: true,
      ...obj
    };



    /*const { nest, max } = libs.d3;
    const latestYear: any = resp.data[0] ? max(resp.data, (d: any) => d["Year"]) : false;
    const data = resp.data[0] ? resp.data.filter((d: any) => d["Year"] === latestYear) : [];

    const obj: Record<string, any> = {};

    if(data.length === 0) {
  
      return{
        raceByDegrees: false
      }
    }


    else {
      nest()
        .key((d: any) => d["Degree ID"])
        .entries(data)
        .forEach((group: any) => {
          const id = group.key;
          group.values
            .sort((a: any, b: any) => b["Completions"] - a["Completions"])
            .slice(0, 3)
            .forEach((d: any, i: any) => {
              obj[`degree${id}RaceName${i + 1}`] = d["IPEDS Race"];
              obj[`degree${id}RaceValue${i + 1}`] = d["Completions"];
              obj[`degree${id}RaceVisible${i + 1}`] = d["Completions"] === 0 ? false : true;
            });
        });
    }

    const result: Record<string, any> = { raceByDegrees: data[0] ? true : false };

    // Extract the elements inside obj and add them to the result
    Object.keys(obj).forEach((key: any) => {
      result[key] = obj[key];
    });

    return result;
    */
  }
};

export default generator;
