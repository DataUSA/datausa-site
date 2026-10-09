// Converted from legacy canon_cms_generator #627 "[Education] Degrees by population" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 627,
  name: "[Education] Degrees by population",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=pums_5&include=${attrs.hierarchy}:${attrs.id}&drilldowns=Year,Group&measures=Total+Population&parents=false&time=Year.latest`,
  logic: (resp, {libs, formatters, variables}) => {
    const {id} = variables;
    const data = resp.data
    const {abbreviate} = formatters;

    const lastYearPumsEducation: any = data[0] ? libs.d3.max(data, (d: any) => d.Year) : false

    data.sort((a: any, b: any) => b["Total Population"] > a["Total Population"] ? 1 : -1);

    const top3DegreesPopulation: any = data[0] ? data.slice(0, 3).map((d: any, i: any) => `${d["Group"]} (${abbreviate(d["Total Population"])})`) : false

    return{
      lastYearPumsEducation,
      top3DegreesPopulation
    }


  }
};

export default generator;
