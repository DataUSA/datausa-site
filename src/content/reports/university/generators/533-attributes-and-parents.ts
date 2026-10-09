// Converted from legacy canon_cms_generator #533 "Attributes and Parents" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 533,
  name: "Attributes and Parents",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,County,${attrs.hierarchy}&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&time=Year.latest&parents=true`,
  logic: (resp, {libs, variables}) => {
    ///api/data?University=<id>&measures=Completions&properties=County%20Name,County ID&parents=true
    const {hierarchy} = variables;

    const latestYear = libs.d3.max(resp.data, (d: any) => d["Year"]);
    const data_ = resp.data.filter((d: any) => d["Year"] === latestYear);

    const data = data_[0];

    const url = (d: any) => `<a href='/profile/geo/${d["County ID"]}'>${d["County"]}</a>`;
    const urlUniv = (id: any, d: any) => id ? `<a href='/profile/university/${id}'>${d}</a>` : "";

    return {
      nameCarnegie: data ? urlUniv(data["Carnegie ID"], data["Carnegie"]) : false,
      idCarnegie: data ? data["Carnegie ID"] : false,
      nameCarnegieParent: hierarchy === "Carnegie Parent" ? "" : data ? data["Carnegie Parent ID"] !== "NAD" ? urlUniv(data["Carnegie Parent ID"], data["Carnegie Parent"]) : "" : "",
      idCarnegieParent: data ? data["Carnegie Parent ID"] : false,
      nameCounty: (data && hierarchy === "University") ? url(data) : false,
      idCounty: (data && data["County ID"] && hierarchy === "University") ? data["County ID"] : false,
      _nameCarnegieParent: data ? data["Carnegie Parent"] || data["University"] : false
    }
  }
};

export default generator;
