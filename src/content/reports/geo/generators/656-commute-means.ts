// Converted from legacy canon_cms_generator #656 "Commute (Means)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 656,
  name: "Commute (Means)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygt_means_of_transportation_to_work_5&include=${attrs.hierarchy}:${attrs.id}&measures=Commute+Means&sort=Commute+Means.desc&drilldowns=Year,Group&time=Year.latest`,
  logic: (resp, {libs}) => {
    const measure: string = "Commute Means";
    const {max, sum} = libs.d3;
    const data_ = resp.data;

    const year = data_.length > 0 ? max(data_, (d: any) => d["Year"]) : 0;
    const data = data_.filter((d: any) => d["Year"]*1 === year*1);
    const total = data.length > 0 ? sum(data, (d: any) => d[measure]) : 0;

    return {
      commuteMeans1: data.length > 0 && data[0].Group,
      commuteMeans2: data.length > 1 && data[1].Group,
      commuteMeans3: data.length > 2 && data[2].Group,
      commuteMeans1Pct: total > 0 ? data.length > 0 && data[0][measure] / total * 100 : false,
      commuteMeans2Pct:  total > 0 ? data.length > 1 && data[1][measure] / total * 100 : false,
      commuteMeans3Pct:  total > 0 ? data.length > 2 && data[2][measure] / total * 100 : false,
      commuteMeansYear: data[0] ? data[0].Year : false
    }
  }
};

export default generator;
