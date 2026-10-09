// Converted from legacy canon_cms_generator #519 "[Education] Graduates (Universities)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 519,
  name: "[Education] Graduates (Universities)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=University,Year,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&limit=10&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {



    if (!resp.data.length) return {universityGrads: false};
    const {commas} = formatters;

    const {max} = libs.d3;
    const currYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === currYear);

    const aboutUniversities = data.slice(0, 3)
      .map((d: any, i: any) => `<a href="/profile/university/${d["University ID"]}">${d.University}</a> (${commas(d["Completions"])} degrees${!i ? ` awarded in ${d.Year}` : ""})`)

    return {
      aboutUniversities: aboutUniversities,
      universityGrads: data.slice(0, 5),
      universityTop5: data.slice(0, 5).map((d: any) => d["University ID"]),
      universityGradsYear: data[0].Year,
      universityGrads1Name: data.length > 0 && `<a href="/profile/university/${data[0]["Slug University"] || data[0]["University ID"]}">${data[0].University}</a>`,
      universityGrads1Value: data.length > 0 && data[0].Completions,
      universityGrads2Name: data.length > 1 && `<a href="/profile/university/${data[1]["Slug University"] || data[1]["University ID"]}">${data[1].University}</a>`,
      universityGrads2Value: data.length > 1 && data[1].Completions,
      universityGrads3Name: data.length > 2 && `<a href="/profile/university/${data[2]["Slug University"] || data[2]["University ID"]}">${data[2].University}</a>`,
      universityGrads3Value: data.length > 2 && data[2].Completions,
      universityGrads5text: data.length > 5 ? "top 5 " : "",
      fewUniversities: data.length < 10,
      manyUniversities: data.length === 10
    };

  }
};

export default generator;
