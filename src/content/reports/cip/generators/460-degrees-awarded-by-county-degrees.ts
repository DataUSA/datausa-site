// Converted from legacy canon_cms_generator #460 "[Degrees Awarded by County] Degrees" (profile: cip) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 460,
  name: "[Degrees Awarded by County] Degrees",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=County%2CYear&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs, formatters}) => {
    const {max} = libs.d3;
    const latestYear = max(resp.data, (d: any) => d["Year"]);
    const data = resp.data.filter((d: any) => d["Year"] === latestYear);

    const url = (d: any) => `<a href='/profile/geo/${d["County ID"]}'>${d["County"]}</a>`;

    return {
      degree1County: data[0] ? data[0] && url(data[0]) : false,
      degreesAwarded1County: data[0] ? formatters.commas(data[0].Completions) : false,
      degree2County: data[1] ? data[1] && url(data[1]) : false,
      degreesAwarded2County: data[1] ? formatters.commas(data[1].Completions) : false,
      degree3County: data[2] ? data[2] && url(data[2]) : false,
      degreesAwarded3County: data[2] ? formatters.commas(data[2].Completions) : false,
      degreesAwardedByCountyVis: data.length > 10,
    }
  }
};

export default generator;
