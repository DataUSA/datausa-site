// Converted from legacy canon_cms_generator #742 "Degrees RCA" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 742,
  name: "Degrees RCA",
  allowed: "always",
  api: attrs => `${attrs.tesseract}complexity/rca_historical.jsonrecords?cube=ipeds_completions&location=Place&activity=${attrs.hierarchy}&measure=Completions&time=Year&cuts=${attrs.hierarchy}:${attrs.id}&time_filter=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const data = resp.data.filter((loc: any) => loc["Place"] !== "#null");

    const latestYear = libs.d3.max(data, (d: any) => d["Year"]);
    const data_ = data.filter((d: any) => d["Year"] === latestYear);
    const {name} = variables;

    const url = (d: any) => `<a href='/profile/geo/${d["Place ID"]}'>${d["Place"]}</a>`;

    data_.sort((a: any, b: any) => b["Completions RCA"] - a["Completions RCA"])

    const degreeTopRCA = data_.slice(0, 3).map(url);

    const degreeTopRCAText = degreeTopRCA.length > 1 ? `In ${latestYear}, the locations with a relatively high number of ${name} degree recipients are ${formatters.list(degreeTopRCA)}.` : degreeTopRCA.length == 1 ? `In ${latestYear}, the location with a relatively high number of ${name} degree recipients is ${degreeTopRCA}.` : ""

    return {
      degreeTopRCAYear: latestYear,
      degreeTopRCA: degreeTopRCA,
      degreeTopRCAText: degreeTopRCAText
    }
  }
};

export default generator;
