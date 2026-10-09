// Converted from legacy canon_cms_generator #753 "Commute (Buckets)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 753,
  name: "Commute (Buckets)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data?cube=acs_ygt_travel_time_to_work_5&include=${attrs.hierarchy}:${attrs.id}&measures=Commuter+Population&drilldowns=Year,Travel+Time`,
  logic: (resp, {libs}) => {
    const {max, sum} = libs.d3;
    const data_ = resp.data;

    const currYear = max(data_, (d: any) => d["Year"]);
    const data = data_.filter((d: any) => d["Year"] === currYear);


    const superCommute = data.find((d: any) => d["Travel Time ID"] === 11)["Commuter Population"];
    const total = sum(data, (d: any) => d["Commuter Population"]);

    return {
      superCommuters: (superCommute / total) * 100
    }
  }
};

export default generator;
