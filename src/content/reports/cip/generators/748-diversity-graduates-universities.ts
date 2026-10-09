// Converted from legacy canon_cms_generator #748 "[Diversity] Graduates (Universities)" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 748,
  name: "[Diversity] Graduates (Universities)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,University&locale=${attrs.locale}&measures=Completions&sort=Completions.desc`,
  logic: (resp, {libs}) => {
    const {max} = libs.d3;


    if(!resp.data[0]){
      return {
        aboutUniversities: false,
        universityGrads: false,
        universityTop5: false,
        universityGradsYear: false,
        universityGrads1Name: false,
        universityGrads1Value: false,
        universityGrads2Name: false,
        universityGrads2Value: false,
        universityGrads3Name: false,
        universityGrads3Value: false,
        universityGrads5text: false,
        fewUniversities: false,
        manyUniversities: false
      };
    }
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    //const data = resp.data

    const formatter = libs.d3.format(",");

    const url = (d: any) => `<a href='/profile/university/${d["University ID"]}'>${d["University"]}</a>`;

    const aboutUniversities = data.slice(0, 3)
      .map((d: any) => `${url(d)}, with ${formatter(d["Completions"])} graduates`)

    return {
      aboutUniversities: aboutUniversities,
      universityGrads: data.slice(0, 5),
      universityTop5: data.slice(0, 5).map((d: any) => `${d["University ID"]}`),
      universityGradsYear: data[0].Year,
      universityGrads1Name: data.length > 0 && url(data[0]),
      universityGrads1Value: data.length > 0 && data[0].Completions,
      universityGrads2Name: data.length > 1 && url(data[1]),
      universityGrads2Value: data.length > 1 && data[1].Completions,
      universityGrads3Name: data.length > 2 && url(data[2]),
      universityGrads3Value: data.length > 2 && data[2].Completions,
      universityGrads5text: data.length > 5 ? "top 5 " : "",
      fewUniversities: data.length < 50,
      manyUniversities: data.length === 50
    };

  }
};

export default generator;
