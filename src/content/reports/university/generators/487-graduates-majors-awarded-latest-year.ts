// Converted from legacy canon_cms_generator #487 "[Graduates] Majors Awarded - Latest Year" (profile: university) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 487,
  name: "[Graduates] Majors Awarded - Latest Year",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=CIP6,Year&${attrs.hierarchy}=${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest`,
  logic: (resp, {libs}) => {
    const data_ = resp.data.filter((d: any) => d["Completions"] > 0)

    if (data_.length < 3) {
      return {
        majorsAwardedVis: false
      }
    }

    else{
      const latestYear = libs.d3.max(data_, (d: any) => d["Year"]);
  
      return {
        degreeTopLatestYear: latestYear,
        majorsAwardedVis: true
      }
    }
  }
};

export default generator;
