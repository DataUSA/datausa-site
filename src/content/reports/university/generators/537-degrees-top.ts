// Converted from legacy canon_cms_generator #537 "Degrees (Top)" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 537,
  name: "Degrees (Top)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,CIP6&locale=en&measures=Completions&include=${attrs.hierarchy}:${attrs.id}&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {formatters}) => {
    const data_ = resp.data;

    const url = (d: any) => `<a href='/profile/cip/${d["CIP6 ID"]}'>${d["CIP6"]}</a>`;
    const {commas} = formatters;

    const latestYearDegrees = data_[0]["Year"]

    const data = data_.slice(0, 3).map((d: any, i: any) => `${url(d)} (${commas(d["Completions"])} degrees${!i ? " awarded" : ""})`);
    return {
      latestYearDegrees,
      degreeCommonTop3: data,
      degreeTop1: data[0],
      degreeTop2: data[1],
      degreeTop3: data[2]
    }
  }
};

export default generator;
