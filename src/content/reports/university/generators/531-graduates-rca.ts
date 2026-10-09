// Converted from legacy canon_cms_generator #531 "[Graduates] RCA" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 531,
  name: "[Graduates] RCA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=${attrs.hierarchy}&activity=CIP2&measure=Completions&time=Year&filter=${attrs.hierarchy}:${attrs.id}`,
  logic: (resp, {libs, formatters}) => {
    const {commas} = formatters;
    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    data.sort((a: any, b: any) => b["Completions RCA"] - a["Completions RCA"])

    data.forEach((d: any) => {
      d["CIP2 ID"] = `${d["CIP2 ID"]}`.padStart(2, '0');
    })

    //const data = resp.data;

    const url = (d: any) => `<a href='/profile/cip/${d["CIP2 ID"]}'>${d["CIP2"]}</a>`;

    const gradsRCATop3 = data.slice(0, 3).map((d: any, i: any) => `${url(d)} (${commas(d["Completions"])} degrees${!i ? " awarded" : ""})`)

    const gradsRCATop5Names = data.slice(0, 5).map(url);
    const commonGradsRCAIds = data.slice(0, 5).map((d: any) => d["CIP2 ID"]).join();
    const gradsRCATop5 = data.slice(0, 5).map((d: any, i: any) => `${url(d)} (${commas(d["Completions"])} degrees${!i ? " awarded" : ""})`);

    return {
      commonGradsRCAIds,
      gradsRCATopYear: latestYear,
      gradsRCATop3,
      gradsRCATop5,
      gradsRCATop5Names,
      gradsRCAVis: latestYear ? true : false,
    }
  }
};

export default generator;
