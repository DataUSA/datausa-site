// Converted from legacy canon_cms_generator #527 "[Education] Graduates (Majors)" (profile: geo) by scripts/legacy-export/extract.ts.
// The body below is the original CMS logic as a typed module; the engine passes the values Canon exposed as globals.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, prefer-const */
import type {GeneratorDefinition} from "@/lib/reports/types";

const generator: GeneratorDefinition = {
  id: 527,
  name: "[Education] Graduates (Majors)",
  allowed: "always",
  api: attrs => `${attrs.tesseract}tesseract/data.jsonrecords?cube=ipeds_completions&drilldowns=Year,CIP6&include=${attrs.hierarchy}:${attrs.id}&locale=en&measures=Completions&sort=Completions.desc&time=Year.latest&limit=3`,
  logic: (resp) => {
    ///api/data?Geography=<id>&measures=Completions&year=latest&drilldowns=CIP6&order=Completions&sort=desc&limit=3

    return {
      cipGrads: resp.data,
      cipGrad1Name: resp.data.length > 0 && `<a href="/profile/cip/${resp.data[0]["Slug CIP6"] || resp.data[0]["CIP6 ID"]}">${resp.data[0].CIP6}</a>`,
      cipGrad1Value: resp.data.length > 0 && resp.data[0].Completions,
      cipGrad2Name: resp.data.length > 1 && `<a href="/profile/cip/${resp.data[1]["Slug CIP6"] || resp.data[1]["CIP6 ID"]}">${resp.data[1].CIP6}</a>`,
      cipGrad2Value: resp.data.length > 1 && resp.data[1].Completions,
      cipGrad3Name: resp.data.length > 2 && `<a href="/profile/cip/${resp.data[2]["Slug CIP6"] || resp.data[2]["CIP6 ID"]}">${resp.data[2].CIP6}</a>`,
      cipGrad3Value: resp.data.length > 2 && resp.data[2].Completions
    }
  }
};

export default generator;
